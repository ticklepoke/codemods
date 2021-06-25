const a = function () {};
const b = function () {
  this.a = 1;
};
const c = function () {
  let a = 1;
};
const d = function () {
  return 1;
};
const e = function () {
  return this.a;
};
const aa = async function () {};
const bb = async function () {
  this.a = 1;
};
const cc = async function () {
  let a = 1;
};
const dd = async function () {
  return 1;
};
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
