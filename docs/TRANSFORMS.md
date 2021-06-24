## Transforms

### remove-debugger

Removes all debugger statements


```ts
// Input code
1+1;
debugger;

// Output code
1+1;
```
### remove-console

Removes all console statements, include destructured console statements

```ts
// Input code
console.log();

const { log } = console;

log();

const copiedLog = log; // Also handles this stupid case

copiedLog();

// Output code
// empty
```

### convert-template-literal

Converts template literals without any template elements to string literals

```ts
// Input code
const a = `abcde`;
const b = `1234${true}`;


// Output code
const a = 'abcde';
const b = `1234${true}`;

```

### convert-object-destructure

Converts variable declarations to object destructure. Also combines object destructures of the same member expression

```ts
// Input code
const a = obj.a;
const b = obj.b;
const d = obj.c;

const c = newObj.c;

function bar() {
  const a = obj.a;
  const c = obj.c;
  const d = obj.c;
  const e = otherObj.a;
}

// Output code
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
```

### convert-object-shorthand

Convert object expressions and object patterns that have the same key and value to shorthand

```ts
// Input code
const { a: a } = obj;

bar({a: a});


// Output code
const { a } = obj;

bar({ a });

```

### convert-concat-strings

Converts string concatenations to template literals. Unable to handle escaped characters

```ts
// Input code
let vars = "b"
"a" + vars + "c"

// Output code
let vars = "b"
`a${vars}c`

```

### convert-let-const

Converts variable declarations that are not reassigned from `let` to `const`. 

- Considers shadowed variables

- Considers UpdateExpressions (`a++`)

**Improvements**: To split object patterns into separate variable declarations if one of the variable is reassigned. Otherwise, change the entire declarator to const: `const { a, b } = fn()`.

**Improvements**: Support for array patterns: `const [ a ] = fn()`

```ts
// Input code
let a = 1;
let b = 1;
b = 2;
{
  let a = 2;
  let b = 3;
  a = 3;
}

// Output code
const a = 1;
let b = 1;
b = 2;
{
  let a = 2;
  const b = 3;
  a = 3;
}

```

### convert-function-expression-arrow

Transfrom function expressions to arrow functions without violating lexical this. Only converts if `this` is not used in the function body:

- Preserves async function signatures

- Does not transform generator functions (arrow functions cannot be generators)

**Improvements**: To preserve async and generator functions

```ts
// Input code
const a = function() {};
const b = function() { this };

// Output code
const a = () => {};
const b = function() { this };
```

### convert-bind-arrow-function

Transform function expression with `.bind(this)` to arrow functions.

- Preserves async function signatures

- Does not transform generator functions (arrow functions cannot be generators)

**Improvements**: To preserve async and generator functions

```ts
// Input code
const a = function() {}.bind(this);

// Output code
const a = () => {};

```
### convert-then-async

Convert `.then()` promises to `async / await` with support for `catch` and `finally` blocks

```ts
// Input code
function bar() {
  return myPromise.then((a) => a).catch(e => e).finally()
}

// Output code
async function bar() {
  try {
    const a = await myPromise;
  } catch (e) {
    return e
  } finally {

  }
}

```