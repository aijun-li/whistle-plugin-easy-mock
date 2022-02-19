const Mock = require("mockjs");

function resolveJSON(data) {
  const obj = Mock.mock(JSON.parse(data));
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$$") && key.length > 2) {
      const realKey = key.slice(2);
      obj[realKey] = JSON.stringify(obj[key]);
      delete obj[key];
    }
  }
  return JSON.stringify(obj);
}

module.exports = (server, options) => {
  // handle http request
  server.on("request", (req, res) => {
    const { pathname, searchParams } = new URL(req.originalReq.url);
    const serviceMethod = searchParams.get("service_method");
    const isIDL = Boolean(serviceMethod);

    const rules = options.storage.getProperty(isIDL ? "idl" : "http");
    let finalResponse = "";
    try {
      rules.some(({ pattern, data }) => {
        if (
          (isIDL && serviceMethod === pattern) ||
          (!isIDL && pathname.includes(pattern))
        ) {
          finalResponse = resolveJSON(data);
          return true;
        }
      });
    } catch {
      finalResponse = `Rule with pattern '${pattern}' is invalid!`;
      console.error(finalResponse);
    }

    if (finalResponse) {
      res.setHeader("Content-Type", "application/json; charset=UTF-8");
      res.end(finalResponse);
    } else {
      req.passThrough();
    }
  });

  // handle websocket request
  server.on("upgrade", (req, socket) => {
    // do something
    req.passThrough();
  });

  // handle tunnel request
  server.on("connect", (req, socket) => {
    // do something
    req.passThrough();
  });
};
