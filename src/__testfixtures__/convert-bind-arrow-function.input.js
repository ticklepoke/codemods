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

const aa = async function (a) {
  return 1;
}.bind(this);

const bb = async function (a) {
  return 1;
}.bind(that);

const cc = async function (a, b) {
  1 + 1;
  return 1;
}.bind(this);

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
