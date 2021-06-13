const {
    a,
    b,
    c: d
} = obj;

const {
  c
} = newObj;

function bar() {
    const {
        a,
        c,
        c: d
    } = obj;
    const {
      a: e
    } = otherObj;
}