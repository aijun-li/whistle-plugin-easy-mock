const Mock = require('mockjs');
const JSON5 = require('json5');
const { LocalKey } = require('./const');

const CacheMap = new Map();

function resolveJSON(data) {
  const obj = Mock.mock(JSON5.parse(data));
  const jsonStr = JSON.stringify(obj);
  const json = JSON.parse(jsonStr, function (key, value) {
    if (key.startsWith('$$') && key.length > 2) {
      this[key.slice(2)] = JSON.stringify(value);
      return undefined;
    } else {
      return value;
    }
  });
  return JSON.stringify(json);
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
    if (host) {
      req.headers[options.config.REAL_HOST_HEADER] = host;
    }

    const { pathname, searchParams } = new URL(oReq.url);
    const rawBody = await getBody(req);
    let serviceMethod = searchParams.get('service_method');

    if (!serviceMethod && rawBody) {
      const contentType = req.headers['content-type'].split(';')[0];
      switch (contentType) {
        case 'application/x-www-form-urlencoded':
          serviceMethod = decodeURIComponent(
            rawBody
              .split('&')
              .find((param) => param.startsWith('service_method'))
              ?.split('=')?.[1] ?? '',
          );
          break;
        case 'application/json':
          try {
            serviceMethod = JSON.parse(rawBody).service_method;
          } catch {}
          break;
      }
    }

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

    let currentPattern = '';
    try {
      rules.some(({ pattern, data, enabled, delay, idx }) => {
        currentPattern = pattern;

        // check if rule enabled
        if (!enabled) {
          return false;
        }

        const json = data[idx].value;
        // check if match rules
        if ((isIDL && serviceMethod === pattern) || (!isIDL && pathname.includes(pattern))) {
          resDelay = delay * 1000;

          hasMatchRule = true;

          // check if data is empty object
          if (json !== '{}') {
            finalResponse = resolveJSON(json);
          }

          return true;
        }

        return false;
      });
    } catch (error) {
      finalResponse = `Error: Rule with pattern '${currentPattern}' is invalid!`;
      console.error(finalResponse, error);
    }

    if (hasMatchRule) {
      if (resDelay) {
        await sleep(resDelay);
      }
      if (finalResponse) {
        res.setHeader('easy-mock-type', 'mock');
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
        const key = generateCacheKey(oReq.url, oReq.method, rawBody);

        if (cache.has(key)) {
          const { body, headers, code } = cache.get(key);
          res.setHeader('easy-mock-type', 'cache');
          res.writeHead(code, headers);
          res.end(body);
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
