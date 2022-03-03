const PREFIX = '/api';
const { LocalKey } = require('../const');

module.exports = (router) => {
  router.get(`${PREFIX}/collection`, (ctx) => {
    const collections = ctx.storage.getProperty(LocalKey.Collections)?.map(({ title, id }) => ({
      title,
      id,
    }));

    ctx.body = {
      code: 0,
      msg: '',
      data: collections,
    };
  });

  router.post(`${PREFIX}/collection`, (ctx) => {
    const { title, id } = ctx.request.body;
    const collections = ctx.storage.getProperty(LocalKey.Collections) ?? [];

    if (collections.some((c) => c.id === id)) {
      ctx.body = {
        code: -1,
        msg: 'Invalid collection id!',
      };
      return;
    }

    collections.push({ title, id, rules: { idl: [], http: [] }, zap: false });
    ctx.storage.setProperty(LocalKey.Collections, collections);

    ctx.body = {
      code: 0,
      msg: '',
    };
  });

  router.delete(`${PREFIX}/collection/:id`, (ctx) => {
    const collections = ctx.storage.getProperty(LocalKey.Collections) ?? [];
    const idx = collections.findIndex(({ id }) => id === ctx.params.id);

    if (idx < 0) {
      ctx.body = {
        code: -1,
        msg: 'Invalid collection id!',
      };
      return;
    }

    collections.splice(idx, 1);
    ctx.storage.setProperty(LocalKey.Collections, collections);

    ctx.body = {
      code: 0,
      msg: '',
    };
  });

  router.get(`${PREFIX}/collection/:id`, (ctx) => {
    const collections = ctx.storage.getProperty(LocalKey.Collections) ?? [];
    const collection = collections.find(({ id }) => id === ctx.params.id);

    ctx.body = collection
      ? {
          code: 0,
          msg: '',
          data: collection,
        }
      : {
          code: -1,
          msg: 'Invalid collection id!',
        };
  });

  router.put(`${PREFIX}/collection/:id`, (ctx) => {
    const rules = ctx.request.body;
    const collections = ctx.storage.getProperty(LocalKey.Collections) ?? [];
    const collection = collections.find(({ id }) => id === ctx.params.id);

    if (!collection) {
      ctx.body = {
        code: -1,
        msg: 'Invalid collection id!',
      };
      return;
    }

    collection.rules = rules;
    ctx.storage.setProperty(LocalKey.Collections, collections);

    ctx.body = {
      code: 0,
      msg: '',
    };
  });

  router.put(`${PREFIX}/collection/:id/zap`, (ctx) => {
    const body = ctx.request.body;

    if (!body || typeof body.enable !== 'boolean') {
      ctx.body = {
        code: -1,
        msg: 'Invalid parameter enable!',
      };
      return;
    }

    const collections = ctx.storage.getProperty(LocalKey.Collections) ?? [];
    const collection = collections.find(({ id }) => id === ctx.params.id);

    if (!collection) {
      ctx.body = {
        code: -1,
        msg: 'Invalid collection id!',
      };
      return;
    }

    collection.zap = body.enable;
    ctx.storage.setProperty(LocalKey.Collections, collections);

    ctx.body = {
      code: 0,
      msg: '',
    };
  });
};
