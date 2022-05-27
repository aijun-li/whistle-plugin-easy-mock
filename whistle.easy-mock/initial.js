const { LocalKey } = require('./lib/const');

function updateOldVersion(storage) {
  let currentVersion = storage.getProperty(LocalKey.Version) ?? 0;
  const collections = storage.getProperty(LocalKey.Collections) ?? [];

  // init collections
  if (collections.length === 0 || collections[0].id !== 'default') {
    const oldIDL = ctx.storage.getProperty('idl');
    const oldHTTP = ctx.storage.getProperty('http');
    const defaultCollection = {
      title: 'Default',
      id: 'default',
      rules: {
        idl: typeof oldIDL === 'undefined' ? [] : oldIDL,
        http: typeof oldHTTP === 'undefined' ? [] : oldHTTP,
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

  // support lable for multi-page
  if (currentVersion < 0.5) {
    collections.forEach((collection) => {
      collection.rules.idl.forEach((item) => {
        item.data = item.data.map((data, index) => ({
          label: `${index}`,
          value: data,
        }));
      });
      collection.rules.http.forEach((item) => {
        item.data = item.data.map((data, index) => ({
          label: `${index}`,
          value: data,
        }));
      });
    });

    storage.setProperty(LocalKey.Collections, collections);
    storage.setProperty(LocalKey.Version, 0.5);
    currentVersion = 0.5;
  }

  // change type word 'idl' to 'rpc'
  if (currentVersion < 0.7) {
    collections.forEach((collection) => {
      collection.rules.idl.forEach((item) => {
        item.type = 'rpc';
      });
    });

    storage.setProperty(LocalKey.Collections, collections);
    storage.setProperty(LocalKey.Version, 0.7);
    currentVersion = 0.7;
  }
}

module.exports = (options) => {
  updateOldVersion(options.storage);
};
