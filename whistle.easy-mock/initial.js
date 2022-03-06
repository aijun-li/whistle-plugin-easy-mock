const { LocalKey } = require('./lib/const');

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

module.exports = (options) => {
  updateOldVersion(options.storage);
};
