const serverless = require('serverless-http');

const initApp = require('./api_init')

module.exports.handler = serverless(initApp());
    
