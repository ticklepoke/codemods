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

Convert object expressions and object patterns that have the same key and value to shorthand;

```ts
// Input code
const { a: a } = obj;

bar({a: a});


// Output code
const { a } = obj;

bar({ a });

```