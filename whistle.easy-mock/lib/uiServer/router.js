const PREFIX = "/api";
const { LocalKey } = require("../const");

module.exports = (router) => {
  router.get(`${PREFIX}/collection`, (ctx) => {
    const collections = (
      ctx.storage.getProperty(LocalKey.Collections) ?? []
    ).map(({ title, id }) => ({
      title,
      id,
    }));

    if (collections.length === 0 || collections[0].id !== "default") {
      const oldIDL = ctx.storage.getProperty("idl");
      const oldHTTP = ctx.storage.getProperty("http");
      const defaultCollection = {
        title: "Default",
        id: "default",
        rules: {
          idl: oldIDL ?? [],
          http: oldHTTP ?? [],
        },
      };
      collections.unshift(defaultCollection);
      ctx.storage.setProperty(LocalKey.Collections, collections);
    }

    ctx.body = {
      code: 0,
      msg: "",
      data: collections,
    };
  });

  router.post(`${PREFIX}/collection`, (ctx) => {
    const { title, id } = ctx.request.body;
    const collections = ctx.storage.getProperty(LocalKey.Collections) ?? [];
    collections.push({ title, id, rules: { idl: [], http: [] } });
    ctx.storage.setProperty(LocalKey.Collections, collections);

    ctx.body = {
      code: 0,
      msg: "",
    };
  });

  router.delete(`${PREFIX}/collection/:id`, (ctx) => {
    const collections = ctx.storage.getProperty(LocalKey.Collections) ?? [];
    const idx = collections.findIndex(({ id }) => id === ctx.params.id);
    collections.splice(idx, 1);
    ctx.storage.setProperty(LocalKey.Collections, collections);

    ctx.body = {
      code: 0,
      msg: "",
    };
  });

  router.get(`${PREFIX}/collection/:id`, (ctx) => {
    const collections = ctx.storage.getProperty(LocalKey.Collections) ?? [];
    const collection = collections.find(({ id }) => id === ctx.params.id);

    ctx.body = {
      code: 0,
      msg: "",
      data: collection,
    };
  });

  router.put(`${PREFIX}/collection/:id`, (ctx) => {
    const rules = ctx.request.body;
    const collections = ctx.storage.getProperty(LocalKey.Collections) ?? [];
    const collection = collections.find(({ id }) => id === ctx.params.id);
    collection.rules = rules;
    ctx.storage.setProperty(LocalKey.Collections, collections);

    ctx.body = {
      code: 0,
      msg: "",
    };
  });
};
