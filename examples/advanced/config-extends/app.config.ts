export default defineAppConfig({
  foo: 'user',
  bar: 'user',
  baz: 'base',
  array: [
    'user',
    'user',
    'user'
  ],
  arrayNested: {
    nested: {
      key: 'user',
      array: [
        'user',
        'user',
        'user'
      ]
    }
  }
})
