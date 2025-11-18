/**
 * Logger utility with configurable log levels
 * Debug mode can be toggled via UI button
 */

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

class Logger {
    constructor() {
        this.isDebugMode = false; // Start with debug mode off
        this.debugChangeListeners = []; // For UI components to listen to debug mode changes
    }

    /**
     * Get current log level based on debug mode
     * @returns {number}
     */
    getCurrentLogLevel() {
        return this.isDebugMode ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
    }

    /**
     * Check if a log level should be output
     * @param {number} level
     * @returns {boolean}
     */
    shouldLog(level) {
        return level <= this.getCurrentLogLevel();
    }

    /**
     * Format log message with timestamp and level
     * @param {string} level
     * @param {string} message
     * @param {...any} args
     * @returns {Array}
     */
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString().substr(11, 12); // HH:mm:ss.sss
        return [`[${timestamp}] [${level}]`, message, ...args];
    }

    /**
     * Error level logging (always shown)
     * @param {string} message
     * @param {...any} args
     */
    error(message, ...args) {
        if (this.shouldLog(LOG_LEVELS.ERROR)) {
            console.error(...this.formatMessage('ERROR', message, ...args));
        }
    }

    /**
     * Warning level logging (always shown)
     * @param {string} message
     * @param {...any} args
     */
    warn(message, ...args) {
        if (this.shouldLog(LOG_LEVELS.WARN)) {
            console.warn(...this.formatMessage('WARN', message, ...args));
        }
    }

    /**
     * Info level logging (default level)
     * @param {string} message
     * @param {...any} args
     */
    info(message, ...args) {
        if (this.shouldLog(LOG_LEVELS.INFO)) {
            console.log(...this.formatMessage('INFO', message, ...args));
        }
    }

    /**
     * Debug level logging (only shown when debug mode is enabled)
     * @param {string} message
     * @param {...any} args
     */
    debug(message, ...args) {
        if (this.shouldLog(LOG_LEVELS.DEBUG)) {
            console.log(...this.formatMessage('DEBUG', message, ...args));
        }
    }

    /**
     * Enable debug mode
     */
    enableDebug() {
        this.isDebugMode = true;
        this.info('Debug mode enabled');
        this.notifyDebugChange();
    }

    /**
     * Disable debug mode
     */
    disableDebug() {
        this.isDebugMode = false;
        console.log('Debug mode disabled');
        this.notifyDebugChange();
    }

    /**
     * Toggle debug mode
     */
    toggleDebug() {
        if (this.isDebugMode) {
            this.disableDebug();
        } else {
            this.enableDebug();
        }
    }

    /**
     * Get current debug status
     * @returns {boolean}
     */
    isDebug() {
        return this.isDebugMode;
    }

    /**
     * Add a listener for debug mode changes
     * @param {Function} listener - Function to call when debug mode changes
     */
    addDebugChangeListener(listener) {
        this.debugChangeListeners.push(listener);
    }

    /**
     * Remove a debug mode change listener
     * @param {Function} listener - Function to remove
     */
    removeDebugChangeListener(listener) {
        this.debugChangeListeners = this.debugChangeListeners.filter(l => l !== listener);
    }

    /**
     * Notify all listeners that debug mode has changed
     */
    notifyDebugChange() {
        this.debugChangeListeners.forEach(listener => {
            try {
                listener(this.isDebugMode);
            } catch (error) {
                console.error('Error in debug change listener:', error);
            }
        });
    }
}

// Create singleton instance
const logger = new Logger();

export default logger;
