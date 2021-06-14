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
## Road Map

Future transforms in the works. Feel free to open an issue if you would like to suggest another transform.

- [ ] **convert-let-const**: Transform variables that are not reassigned from `let` to `const`

- [x] **convert-empty-template-literal**: Transform template literals with no template elements to string literals: 

```ts
// from this
`this is a string`
`template string: ${true}`

// to this
'this is a string'
`template string: ${true}`
```

- [x] **convert-object-destructure**: Transform variable declarations to object-destructure:

```ts
// from this
const a = obj.a

// to this
const { a } = obj
```

- [ ] **convert-bind-arrow-function**: Transform functions which `.bind(this)` to arrow functions

- [x] **convert-object-shorthand**: Convert object literals with same key - values to object shorthand

- [ ] **concat-strings-template-literal**: Convert strings concatenations to template literals:

```ts
// from this
let vars = "b"
"a" + vars + "c"

// to this
let vars = "b"
`a${vars}c`
```

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

- [ ] **convert-.then-async-await**: Conver `.then()` chaining to `async/await`

```ts
// from this
someAsyncFn()
    .then(res => 
    // do something
    )
    .catch(p)
    
// to this
let res = await someAsyncFn()
```
