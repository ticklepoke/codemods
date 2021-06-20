let a = 1;
let b = 2;
let c = 2;
a = 3;
{
  let a = 2;
  let b = 2;
  c = 3;
}
{
  let a = 2;
  let b = 2;
  let c = 2;
}
{
  let d = 2;
  {
    d = 3;
  }
}
function bar() {
  let a = 1;
  let b = 1;
  a = 2;
}
let foo = () => {
  let a = 1;
  let b = 1;
  a = 2;
};
