let object = { a: 1, b: 2, c: { hello: 'world', foo: 'bar' } };;

Object.defineProperty(object, 'baz', {
  value: 123,
  configurable: true,
  writable: false
});

module.exports = object;
