# codemods

JavaScript codemods using jscodeshift

## Usage

Coming soon: npm package

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

// Output code
// empty
```
## Road Map

Future transforms in the works. Feel free to open an issue if you would like to suggest another transform.

- [ ] **convert-let-const**: Transform variables that are not reassigned from `let` to `const`

- [ ] **convert-empty-template-literal**: Transform template literals with no template elements to string literals: 

```ts
// from this
`this is a string`
`template string: ${true}`

// to this
'this is a string'
`template string: ${true}`
```
