# whistle.easy-mock

A whistle plugin for mocking json data.

![options](./whistle.easy-mock/img/demo.gif)

## Feature

---

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

- Support setting response delay (0 - 5s)
  - Set delay to > 0 and leave the mock data as an empty data "{}" will work like delaying the real response

Attention: all operations (except deleting) will only take effect after clicking 'Save' button.
