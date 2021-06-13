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