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
