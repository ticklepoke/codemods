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