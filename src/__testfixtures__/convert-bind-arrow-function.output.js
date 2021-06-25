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

const aa = async (a) => 1;

const bb = async function (a) {
  return 1;
}.bind(that);

const cc = async (a, b) => {
  1 + 1;
  return 1;
};

const dd = async function (a, b) {
  1 + 1;
  return 1;
}.bind(that);

const aaa = function* (a) {
  return 1;
}.bind(this);

const bbb = function* (a) {
  return 1;
}.bind(that);

const ccc = function* (a, b) {
  1 + 1;
  return 1;
}.bind(this);

const ddd = function* (a, b) {
  1 + 1;
  return 1;
}.bind(that);
