let object = {};

Object.defineProperty(object, 'foo', {
  value: 1,
  configurable: false
});

Object.defineProperty(object, 'bar', {
  value: 2,
  configurable: true
});

module.exports = object;