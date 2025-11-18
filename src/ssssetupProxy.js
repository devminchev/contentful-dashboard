const { createProxyMiddleware } = require('http-proxy-middleware');
const { HttpProxyAgent } = require('http-proxy-agent');

module.exports = function (app) {
    let proxyAgent = new HttpProxyAgent('http://10.149.16.141:3546');

    app.use(
        '/health-check',
        createProxyMiddleware({
            target: 'http://general-content-service.stg.pp2.pgt.gaia',
            changeOrigin: true,
            agent: proxyAgent
        })
    );
};
