export {};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineTest } = require('jscodeshift/dist/testUtils');
defineTest(__dirname, 'convert-object-shorthand');
