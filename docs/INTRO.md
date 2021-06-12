# codemods [![CI](https://github.com/ticklepoke/codemods/actions/workflows/CI.yml/badge.svg)](https://github.com/ticklepoke/codemods/actions/workflows/CI.yml)

JavaScript codemods using jscodeshift

## Usage

### via git

```sh 
git clone https://github.com/facebook/jscodeshift.git
```

Install the codeshift runner globally. There is a known bug where the runner doesnt work with yarn: [424](https://github.com/facebook/jscodeshift/issues/424).

```sh
npm install -g jscodeshift
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

Install jscodeshift and format with `dos2unix`
```sh
yarn add jscodeshift &&
dos2unix node_modules/jscodeshift/bin/*
```

Add a transform to your `package.json`
```json
{
  "scripts": {
    "start": "jscodeshift -d -p -t node_modules/@ticklepoke/codemods/dist/[DESIRED TRANSFORM].js [YOUR INPUT FILE].js",
  },
}

```