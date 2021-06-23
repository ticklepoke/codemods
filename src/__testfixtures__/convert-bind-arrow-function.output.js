const a = (a) => 1;

const b = function (a) {
  return 1;
}.bind(that);

const c = (a, b) => {
  1 + 1;
  return 1;
};

const d = function (a, b) {
  1 + 1;
  return 1;
}.bind(that);
