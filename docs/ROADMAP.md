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

- [ ] **convert-object-shorthand**: Convert object literals with same key - values to object shorthand

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