## Road Map

Future transforms in the works. Feel free to open an issue if you would like to suggest another transform.

- [x] **convert-bind-arrow-function**: Transform function expression with `.bind(this)` to arrow functions:

```ts
// from this
const a = function() {}.bind(this);

// to this
const a = () => {};
```

- [x] **convert-function-expression-arrow-function**: Transfrom function expressions to arrow functions without violating lexical `this`. Only converts if `this` is not used in the function body:
```ts
// from this
const a = function() {};

// to this
const a = () => {};

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

- [x] **convert-.then-async-await**: Convert `.then()` chaining to `async/await`

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