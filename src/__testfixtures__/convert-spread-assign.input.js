const a = {
  a: 1,
  b: 2,
  ...otherObj,
  ...anotherObj,
};

const b = {
  a: 1,
  ...otherObj,
  b: 2,
};

const c = {
  a: 1,
  ...{
    b: 2,
  },
  c: 3,
};
