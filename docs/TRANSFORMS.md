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
const a = obj.a

const b = otherObj.b
const c = otherObj.c

const d = otherOtherObj.a;
const e = otherOtherObj.b;

// Output code
const { a } = obj

const { b, c } = otherObj

const {
    a: d,
    b: e
} = otherOtherObj;
```