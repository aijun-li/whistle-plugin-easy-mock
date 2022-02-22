# whistle.easy-mock

A simple mock plugin with ui for whistle

![collection](https://raw.githubusercontent.com/aijun-li/whistle-plugin-easy-mock/main/whistle.easy-mock/img/collection.png)
![demo](https://raw.githubusercontent.com/aijun-li/whistle-plugin-easy-mock/main/whistle.easy-mock/img/demo.gif)

## Usage

Install plugin

```shell
npm i -g whistle.easy-mock
```

Then add rule in whistle
Accept two parameters, separated by '|':

1. (optional) collection id: select which collection to take effect
2. (optional) host: replace the host of the matched request

```
[pattern] easy-mock://[collection id]|[host]

// if you only want to set host (do not miss the '|')
[pattern] easy-mock://|host
```

## Feature

- Create collections to manage your mock data
- Mock data by matching in order of preference:
  1. The value for `service_method` key in the query (fixed at the moment, to be changed in the future)
  2. URL pathname
- Full featured json editor from [svelte-jsoneditor](https://www.npmjs.com/package/svelte-jsoneditor)
- Support [Mock.js](http://mockjs.com/)
- Support further encoding property value (only available on root properties for now):

  ```json
  {
    "$$encode": {
      "name": "mapoos",
      "age": 24
    }
  }

  {
    "encode": "{\"name\":\"mapoos\",\"age\":24}"
  }
  ```

- Support setting response delay (0 - 15s)
  - Set delay to > 0 and leave the mock data as an empty object "{}" will work like delaying the real response

Attention: all operations (except deleting) will only take effect after clicking 'Save' button.
