let object = {};

Object.defineProperty(object, 'foo', {
  value: 1,
  configurable: false
});

Object.defineProperty(object, 'bar', {
  value: 2,
  configurable: true
});

Object.defineProperty(object, 'baz', {
  value: 3,
  configurable: false,
  writable: true
});

module.exports = object;