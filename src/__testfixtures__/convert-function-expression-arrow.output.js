const a = () => {};

const b = function () {
  this.a = 1;
};

const c = () => {
  let a = 1;
};

const d = () => 1;

const e = function () {
  return this.a;
};

const aa = async () => {};

const bb = async function () {
  this.a = 1;
};

const cc = async () => {
  let a = 1;
};

const dd = async () => 1;

const ee = async function () {
  return this.a;
};

const aaa = function* () {};

const bbb = function* () {
  this.a = 1;
};

const ccc = function* () {
  let a = 1;
};

const ddd = function* () {
  return 1;
};

const eee = function* () {
  return this.a;
};
