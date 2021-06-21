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
