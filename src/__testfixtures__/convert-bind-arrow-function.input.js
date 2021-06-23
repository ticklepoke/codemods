const a = function (a) {
  return 1;
}.bind(this);

const b = function (a) {
  return 1;
}.bind(that);

const c = function (a, b) {
  1 + 1;
  return 1;
}.bind(this);

const d = function (a, b) {
  1 + 1;
  return 1;
}.bind(that);
