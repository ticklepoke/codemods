async function a() {
  const c = await b();
  1 + 1;
  return c;
}

async function aa() {
  const { a, c } = await b();
  return a + c;
}

async function aaa() {
  let c = await b();
  c++;
  1 + 1;
  return c;
}

async function b() {
  const d = await c;
  return d;
}

async function ba() {
  const { a, b } = await c;
  return a + b;
}

async function c() {
  try {
    const e = await d;
    return e;
  } catch (err) {
    console.error(err);
  }
}

async function d() {
  try {
    const f = await e;
    return f;
  } catch (err) {
    console.error(err);
  } finally {
    1 + 1;
    return 1;
  }
}

async function e() {
  const { a, b } = await f;
  a + b;
}

const f = async function() {
  const a = await g();
  return a;
};

const g = async () => {
  const a = await h();
  return a;
};

const h = async () => {
  const a = await h();
  return a;
};

const i = async () => {
  const a = await i;
  return a;
};

const j = async () => {
  const a = await j;
  return a;
};

const k = async () => {
  try {
    const a = await k;
    return a;
  } catch (err) {
    return console.error(err);
  }
};
