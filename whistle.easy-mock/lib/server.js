const Mock = require('mockjs');
const { LocalKey } = require('./const');

const CacheMap = new Map();

function resolveJSON(data) {
  const obj = Mock.mock(JSON.parse(data));
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$$') && key.length > 2) {
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

function generateCacheKey(url, method, body = '') {
  return `${method}:${url}-${body}`;
}

module.exports = (server, options) => {
  // handle http request
  server.on('request', async (req, res) => {
    const oReq = req.originalReq;

    const { ruleValue = '' } = oReq;
    const parsedRules = ruleValue.split('|');

    const id = parsedRules[0] || 'default';
    const host = parsedRules[1] || '';
    if (host && req.setReqRules) {
      req.setReqRules(`* ${host}`);
    }

    const { pathname, searchParams } = new URL(oReq.url);

    const rawbody = await getBody(req);
    let body = rawbody;

    if (typeof body === 'string' && body.length > 0) {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    const serviceMethod = searchParams.get('service_method') || body.service_method;

    const isIDL = Boolean(serviceMethod);
    const collections = options.storage.getProperty(LocalKey.Collections) ?? [];
    const collection = collections.find((c) => c.id === id);

    if (!collection) {
      req.passThrough();
      return;
    }

    const rules = collection.rules[isIDL ? 'idl' : 'http'] ?? [];

    let finalResponse = '';
    let resDelay = 0;
    let hasMatchRule = false;

    try {
      rules.some(({ pattern, data, enabled, delay }) => {
        // check if rule enabled
        if (!enabled) {
          return false;
        }

        // check if match rules
        if ((isIDL && serviceMethod === pattern) || (!isIDL && pathname.includes(pattern))) {
          resDelay = delay * 1000;

          hasMatchRule = true;

          // check if data is empty object
          if (data !== '{}') {
            finalResponse = resolveJSON(data);
          }

          return true;
        }

        return false;
      });
    } catch {
      finalResponse = `Error: Rule with pattern '${pattern}' is invalid!`;
      console.error(finalResponse);
    }

    if (hasMatchRule) {
      if (resDelay) {
        await sleep(resDelay);
      }
      if (finalResponse) {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        res.end(finalResponse);
      } else {
        req.passThrough();
      }
    } else if (collection.zap) {
      if (!['GET', 'POST'].includes(oReq.method)) {
        req.passThrough();
      } else {
        if (!CacheMap.has(collection.id)) {
          CacheMap.set(collection.id, new Map());
        }

        const cache = CacheMap.get(collection.id);
        const key = generateCacheKey(oReq.url, oReq.method, rawbody);

        if (cache.has(key)) {
          const { body, headers, code } = cache.get(key);

          res.writeHead(code, headers);
          res.end(body);
          // console.log('return cache!', key);
        } else {
          const client = req.request((svrRes) => {
            res.writeHead(svrRes.statusCode, svrRes.headers);
            if (svrRes.headers['content-type']?.slice(0, 16) === 'application/json') {
              let svrBody;
              svrRes.on('data', (data) => {
                svrBody = svrBody ? Buffer.concat([svrBody, data]) : data;
              });
              svrRes.on('end', () => {
                if (svrBody) {
                  cache.set(key, {
                    code: svrRes.statusCode,
                    headers: svrRes.headers,
                    body: svrBody,
                  });
                  res.end(svrBody);
                } else {
                  res.end();
                }
              });
            } else {
              svrRes.pipe(res);
            }
          });
          req.pipe(client);
        }
      }
    } else {
      CacheMap.delete(collection.id);
      req.passThrough();
    }
  });

  // handle websocket request
  server.on('upgrade', (req, socket) => {
    // do something
    req.passThrough();
  });

  // handle tunnel request
  server.on('connect', (req, socket) => {
    // do something
    req.passThrough();
  });
};
