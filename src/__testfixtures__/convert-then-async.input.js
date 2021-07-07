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

function aaa() {
  return b().then((c) => {
    1 + 1;
    return c;
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

function dd() {
  return e
    .then((f) => f)
    .then((g) => g)
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

const h = () => h().then((a) => a);

const i = () => i.then((a) => a);

const j = () =>
  j.then((a) => {
    return a;
  });

const k = () => k.then((a) => a).catch((err) => console.error(err));

function l() {
  return k
    .then((a) => {
      1 + 1;
      return a;
    })
    .finally(() => {
      1 + 1;
    });
}

function m() {
  return n()
    .then((a) => a)
    .finally(() => 1 + 1);
}
