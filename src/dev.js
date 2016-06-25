// set NODE_ENV=dev && set DEBUG=my:* 
process.env.NODE_ENV = 'dev';
process.env.DEBUG = 'my:*';

require('./server');