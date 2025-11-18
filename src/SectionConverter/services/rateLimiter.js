import logger from '../../utils/logger';

/**
 * Global rate limiter for Contentful CMA requests
 * Ensures strict sequential processing - one request at a time, in order
 * Next request only starts after previous one completely finishes (including retries)
 */
class RateLimiter {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.lastRequestTime = 0;
        this.minInterval = 1500; // 1.5 seconds between requests (increased from 700ms due to aggressive rate limiting)
        this.maxRetries = 3;
        this.baseRetryDelay = 2000; // 2 seconds base delay for retries (increased from 1s due to aggressive rate limiting)
        this.currentRequestId = 0; // For tracking request order
    }

    /**
     * Add a request to the queue
     * @param {Function} requestFunction - Function that returns a promise for the API call
     * @returns {Promise} - Promise that resolves with the API response
     */
    async enqueue(requestFunction) {
        const requestId = ++this.currentRequestId;

        return new Promise((resolve, reject) => {
            this.queue.push({
                id: requestId,
                requestFunction,
                resolve,
                reject,
                retryCount: 0,
                addedAt: Date.now()
            });

            logger.debug(`Rate limiter: Request ${requestId} added to queue (position: ${this.queue.length})`);

            // Start processing if not already running
            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }

    /**
     * Process the queue sequentially - one request at a time, in strict order
     */
    async processQueue() {
        if (this.isProcessing) {
            logger.debug('Rate limiter: Already processing, skipping duplicate call');
            return;
        }

        if (this.queue.length === 0) {
            logger.debug('Rate limiter: Queue is empty, nothing to process');
            return;
        }

        this.isProcessing = true;
        logger.debug(`Rate limiter: Starting sequential processing of ${this.queue.length} requests`);

        // Process requests one by one, in strict order
        while (this.queue.length > 0) {
            const request = this.queue.shift(); // Take the first request (FIFO)

            logger.debug(`Rate limiter: Processing request ${request.id} (${this.queue.length} remaining)`);

            try {
                // Wait for minimum interval since last request
                const now = Date.now();
                const timeSinceLastRequest = now - this.lastRequestTime;
                const waitTime = Math.max(0, this.minInterval - timeSinceLastRequest);

                if (waitTime > 0) {
                    logger.debug(`Rate limiter: Waiting ${waitTime}ms before request ${request.id}`);
                    await this.sleep(waitTime);
                }

                // Execute this request with retry logic - WAIT FOR COMPLETE FINISH
                logger.debug(`Rate limiter: Executing request ${request.id}`);
                const result = await this.executeWithRetry(request.requestFunction, request.retryCount, request.id);
                this.lastRequestTime = Date.now();

                logger.debug(`Rate limiter: Request ${request.id} completed successfully`);
                request.resolve(result);

            } catch (error) {
                logger.error(`Rate limiter: Request ${request.id} failed after all retries:`, error);
                request.reject(error);
            }

            // Important: Only continue to next request after current one is completely done
            logger.debug(`Rate limiter: Request ${request.id} finished, moving to next`);
        }

        this.isProcessing = false;
        logger.debug('Rate limiter: Sequential processing complete, queue empty');
    }

    /**
     * Execute a request with exponential backoff retry logic
     * @param {Function} requestFunction - The request function to execute
     * @param {number} currentRetryCount - Current retry attempt
     * @param {number} requestId - Request ID for logging
     * @returns {Promise} - The request result
     */
    async executeWithRetry(requestFunction, currentRetryCount = 0, requestId = 'unknown') {
        try {
            const result = await requestFunction();
            if (currentRetryCount > 0) {
                logger.debug(`Rate limiter: Request ${requestId} succeeded after ${currentRetryCount} retries`);
            }
            return result;
        } catch (error) {
            // Check if it's a rate limit error (429) and we have retries left
            if (this.isRateLimitError(error) && currentRetryCount < this.maxRetries) {
                const retryDelay = this.calculateRetryDelay(currentRetryCount);
                logger.info(`Rate limiter: Request ${requestId} hit rate limit (429), retrying in ${retryDelay}ms (attempt ${currentRetryCount + 1}/${this.maxRetries})`);

                await this.sleep(retryDelay);
                return await this.executeWithRetry(requestFunction, currentRetryCount + 1, requestId);
            }

            // If it's not a rate limit error or we're out of retries, throw the error
            logger.error(`Rate limiter: Request ${requestId} failed:`, {
                error: error.message,
                status: error.status || error.statusCode,
                retryCount: currentRetryCount
            });
            throw error;
        }
    }

    /**
     * Check if an error is a rate limit error
     * @param {Error} error - The error to check
     * @returns {boolean} - Whether it's a rate limit error
     */
    isRateLimitError(error) {
        return (
            error.status === 429 ||
            error.statusCode === 429 ||
            (error.message && error.message.includes('429')) ||
            (error.message && error.message.toLowerCase().includes('too many requests'))
        );
    }

    /**
     * Calculate retry delay with exponential backoff
     * @param {number} retryCount - Current retry count
     * @returns {number} - Delay in milliseconds
     */
    calculateRetryDelay(retryCount) {
        // Exponential backoff: 1s, 2s, 4s
        return this.baseRetryDelay * Math.pow(2, retryCount);
    }

    /**
     * Sleep for specified milliseconds
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current queue status
     * @returns {Object} - Queue status information
     */
    getStatus() {
        return {
            queueLength: this.queue.length,
            isProcessing: this.isProcessing,
            lastRequestTime: this.lastRequestTime,
            timeSinceLastRequest: Date.now() - this.lastRequestTime,
            currentRequestId: this.currentRequestId,
            nextRequestId: this.queue.length > 0 ? this.queue[0].id : null
        };
    }

    /**
     * Clear the queue (for emergency stops)
     */
    clearQueue() {
        const remainingRequests = this.queue.length;
        this.queue.forEach(({ reject, id }) => {
            reject(new Error(`Request ${id} cancelled - queue cleared`));
        });
        this.queue = [];
        logger.info(`Rate limiter: cleared ${remainingRequests} pending requests`);
    }

    /**
     * Get queue position for a request (for UI feedback)
     * @param {number} requestId - Request ID to find
     * @returns {number} - Position in queue (1-based) or -1 if not found
     */
    getQueuePosition(requestId) {
        const index = this.queue.findIndex(req => req.id === requestId);
        return index === -1 ? -1 : index + 1;
    }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;
