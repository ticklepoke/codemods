let a = 1;
const b = 2;
let c = 2;
a = 3;
{
  const a = 2;
  const b = 2;
  c = 3;
}
{
  const a = 2;
  const b = 2;
  const c = 2;
}
{
  let d = 2;
  {
    d = 3;
  }
}
function bar() {
  let a = 1;
  const b = 1;
  a = 2;
}
const foo = () => {
  let a = 1;
  const b = 1;
  a = 2;
};
{
  let a = 1;
  a++;
}