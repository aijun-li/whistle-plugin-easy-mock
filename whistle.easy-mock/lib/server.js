const Mock = require("mockjs");
const { LocalKey } = require("./const");

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

function sleep(num) {
  return new Promise((res) => {
    setTimeout(res, num);
  });
}

function getBody(req) {
  return new Promise((res) => {
    req.getReqSession((s) => {
      res(s.req.body);
    });
  });
}

module.exports = (server, options) => {
  // handle http request
  server.on("request", async (req, res) => {
    const oReq = req.originalReq;

    const { ruleValue = "" } = oReq;
    const parsedRules = ruleValue.split("|");

    const id = parsedRules[0] || "default";
    const host = parsedRules[1] || "";
    if (host && req.setReqRules) {
      req.setReqRules(`* ${host}`);
    }

    const { pathname, searchParams } = new URL(oReq.url);

    let body = await getBody(req);

    if (typeof body === "string" && body.length > 0) {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    const serviceMethod =
      searchParams.get("service_method") || body.service_method;

    const isIDL = Boolean(serviceMethod);
    const collections = options.storage.getProperty(LocalKey.Collections) ?? [];
    const collection = collections.find((c) => c.id === id);
    const rules = collection?.rules[isIDL ? "idl" : "http"] ?? [];

    let finalResponse = "";
    let resDelay = 0;

    try {
      rules.some(({ pattern, data, enabled, delay }) => {
        // check if rule enabled
        if (!enabled) {
          return false;
        }

        // check if match rules
        if (
          (isIDL && serviceMethod === pattern) ||
          (!isIDL && pathname.includes(pattern))
        ) {
          resDelay = delay * 1000;

          // check if data is empty object
          if (data === "{}") {
            return true;
          }

          finalResponse = resolveJSON(data);
          return true;
        }

        return false;
      });
    } catch {
      finalResponse = `Error: Rule with pattern '${pattern}' is invalid!`;
      console.error(finalResponse);
    }

    if (resDelay) {
      await sleep(resDelay);
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
