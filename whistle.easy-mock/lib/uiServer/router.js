// For help see https://github.com/ZijianHe/koa-router#api-reference
module.exports = (router) => {
  router.get("/api/rules", (ctx) => {
    const idl = ctx.storage.getProperty("idl");
    const http = ctx.storage.getProperty("http");

    ctx.body = {
      code: 0,
      msg: "",
      data: {
        idl: idl ?? [],
        http: http ?? [],
      },
    };
  });

  router.post("/api/rules", (ctx) => {
    const { idl, http } = ctx.request.body;

    if (!Array.isArray(idl) || !Array.isArray(http)) {
      ctx.body = {
        code: -1,
        msg: "Rule list for IDL and HTTP must be array!",
      };
    } else {
      ctx.storage.setProperty("idl", idl);
      ctx.storage.setProperty("http", http);
      ctx.body = {
        code: 0,
        msg: "",
      };
    }
  });
};
