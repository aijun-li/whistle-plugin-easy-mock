const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const onerror = require('koa-onerror');
const serve = require('koa-static');
const path = require('path');
const router = require('koa-router')();
const setupRouter = require('./router');
const { LocalKey } = require('../const');

const MAX_AGE = 1000 * 60 * 5;

function updateOldVersion(storage) {
  let currentVersion = storage.getProperty(LocalKey.Version) ?? 0;
  const collections = storage.getProperty(LocalKey.Collections) ?? [];

  // init collections
  if (collections.length === 0 || collections[0].id !== 'default') {
    const defaultCollection = {
      title: 'Default',
      id: 'default',
      rules: {
        idl: oldIDL ?? [],
        http: oldHTTP ?? [],
      },
    };
    collections.unshift(defaultCollection);
    storage.setProperty(LocalKey.Collections, collections);
  }

  // transform old version for multi-page rule
  if (currentVersion < 0.4) {
    collections.forEach((collection) => {
      collection.rules.idl.forEach((item) => {
        if (!Array.isArray(item.data)) {
          item.data = [item.data];
          item.idx = 0;
        }
      });
      collection.rules.http.forEach((item) => {
        if (!Array.isArray(item.data)) {
          item.data = [item.data];
          item.idx = 0;
        }
      });
    });

    storage.setProperty(LocalKey.Collections, collections);
    storage.setProperty(LocalKey.Version, 0.4);
    currentVersion = 0.4;
  }
}

module.exports = (server, options) => {
  updateOldVersion(options.storage);

  const app = new Koa();
  app.proxy = true;
  app.silent = true;
  app.context.storage = options.storage;
  onerror(app);
  setupRouter(router);
  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(serve(path.join(__dirname, '../../public'), { maxage: MAX_AGE }));
  server.on('request', app.callback());
};
