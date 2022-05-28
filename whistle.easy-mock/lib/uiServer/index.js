const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const onerror = require('koa-onerror');
const serve = require('koa-static');
const path = require('path');
const router = require('koa-router')();
const setupRouter = require('./router');
const WebSocketServer = require('ws').Server;
const MAX_AGE = 1000 * 60 * 5;

module.exports = (server, options) => {
  const app = new Koa();

  app.use(
    cors({
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    }),
  );

  app.proxy = true;
  app.silent = true;
  app.context.storage = options.storage;
  app.context.wsServer = new WebSocketServer({ server });

  onerror(app);
  setupRouter(router);
  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(serve(path.join(__dirname, '../../public'), { maxage: MAX_AGE }));
  server.on('request', app.callback());
};
