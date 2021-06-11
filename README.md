# codemods

JavaScript codemods using jscodeshift

## Usage

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


Input code:
```ts
1+1;
debugger;
```

Output code:
```ts
1+1;
```
