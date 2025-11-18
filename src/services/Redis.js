import axios from 'axios';

const client = axios.create({
    timeout: 3000,
    baseURL: `https://www.jackpotjoy.com/api/contentful-dashboard`,
});

export const healthCheck = () => client.get('/health-check');

export const deleteCache = (params) => client.delete('/purge-cache', { params });
