function a() {
  return b().then((c) => {
    1 + 1;
    return c;
  });
}

function aa() {
  return b().then(({ a, c }) => {
    return a + c;
  });
}

function b() {
  return c.then((d) => d);
}

function ba() {
  return c.then(({ a, b }) => a + b);
}

function c() {
  return d
    .then((e) => e)
    .catch((err) => {
      console.error(err);
    });
}

function d() {
  return e
    .then((f) => f)
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      1 + 1;
      return 1;
    });
}

function e() {
  return f.then(({ a, b }) => {
    a + b;
  });
}

const f = function () {
  return g().then((a) => a);
};

const g = () => {
  return h().then((a) => a);
};
