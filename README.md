# codemods [![CI](https://github.com/ticklepoke/codemods/actions/workflows/CI.yml/badge.svg)](https://github.com/ticklepoke/codemods/actions/workflows/CI.yml)

JavaScript codemods using jscodeshift

## Usage

> The npm package is namespaced to my username (@ticklepoke) for now as it is intended to be a personal project. If this package gains enough traction, I will consider finding a more elegant package name.

### via git

```sh 
git clone https://github.com/facebook/jscodeshift.git
```

Install the codeshift runner globally. There is a known bug where the runner doesnt work with yarn: [424](https://github.com/facebook/jscodeshift/issues/424).

```sh
npm install -g jscodeshift
```

Alternatively, one can format `jscodeshift`'s binaries on every install using a tool such as `dos2unix`:

```sh
dos2unix node_modules/jscodeshift/bin/*
```

Install dependencies and build transforms

```sh
yarn install && yarn build
```

List available transforms

```sh
yarn transform:ls
```

Execute a codemod:

```sh
jscodeshift -t dist/[TRANSFORM FILENAME.js] [YOUR INPUT FILE.js]
```

### via npm

```sh
# npm
npm install @ticklepoke/codemods

# yarn
yarn add @ticklepoke/codemods
```

Install jscodeshift and format with `dos2unix` if we want to use jscodeshift within a `package.json` script
```sh
yarn add jscodeshift &&
dos2unix node_modules/jscodeshift/bin/*
```

Add a transform to your `package.json`
```json
{
  "scripts": {
    "start": "jscodeshift -d -p -t node_modules/@ticklepoke/codemods/[DESIRED TRANSFORM].js [YOUR INPUT FILE].js",
    "list:transform": "node node_modules/@ticklepoke/codemods/index.js",
    "fix:deps": "dos2unix node_modules/jscodeshift/bin/*"
  },
}

```
## Development

### Creating a new transform

To create a new transform, run

```sh
yarn plop
```

This will generate the transform file and relevant test and fixture files.

### Testing

Fill in the fixture files with the input and output code. Then, run

```sh
yarn test
```

### Branch Naming

Branches follow this naming convention:

- For new transforms `feat/transfrom-[transform_name]`

- For bug fixes: `fix/[bug_description]`

- For other chores `chore/[chore_description]`

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

- Supports shadowed variables

- Supports UpdateExpressions (`a++`)

- Supports object patterns `const { a, b } = ...`. Entire object is changed to const only if all properties are not reassigned.

- Supports array patterns `let [a, b] = ...`. Entire array pattern is changed to const only if all properties are not reassigned.

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

```ts
// Input code
const a = function() {}.bind(this);

// Output code
const a = () => {};

```
### convert-then-async

Convert `.then()` promises to `async / await` with support for `catch` and `finally` blocks

- Supports `.then()` chaining

- Only supports promises in a return statement

- Only supports single param callbacks `.then(a => ...)` or `.then(({a, b}) => ...)`. Multi params `.then((a, b) => ...)` and `.then(({a, b}, c) => ...)` are not allowed

- Supports `.then().catch().finally()`, `then().finally()`

**Improvements**: Support for `.then().finally().then()` 

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
### convert-spread-assign

Converts object spread to `Object.assign`, preserving order of properties being written

```ts
// Input code
const a = {
  a: 1,
  b: 2,
  ...otherObj
}

const b = {
  a: 1,
  ...otherObj,
  b:2
}

// Output code
const a = Object.assign({}, {a:1, b:2}, otherObj)

const b = Object.assign({}, {a:1}, otherObj, {b:2})

```

## Road Map

Future transforms in the works. Feel free to open an issue if you would like to suggest another transform.

- [ ] **no-params-reassignment**: Convert function params reassignment to scoped variables

```ts
// from this
bar(baz) {
    baz = 1;
}

// to this
bar(baz) {
    _baz = 1;
}
```

- [ ] **convert-unchained-variables**: Convert chained variable declarations to individual declarations:
```ts
// from this
let a = b = [];
let c = d = 1;

// to this
let b = [];
let a = b;

let d = 1;
let c = d;
```

- [ ] **convert-await-loop-promise-all**: Converts await statements in a loop into `Promise.all()`
```ts
// from this
let data = []
for (let i ....) {
    data.push(await fn())
}
return data

// to this
let promises = [];
for (let i ...) {
    promises.push(fn())
}
return Promise.all(promises)

```

### React Codemods

- [ ] **destructure-props**: Destructures react props:
```ts
// from this:
this.props.bar;

// to this
const { bar } = this.props;
bar;
```

- [ ] **pure-to-memo-function**: Converts class components with only a `render()` method into a `React.memo` functional component
