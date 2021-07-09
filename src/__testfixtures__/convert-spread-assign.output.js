const a = Object.assign({}, {
  a: 1,
  b: 2
}, otherObj, anotherObj);

const b = Object.assign({}, {
  a: 1
}, otherObj, {
  b: 2
});

const c = Object.assign({}, {
  a: 1
}, {
  b: 2
}, {
  c: 3
});
