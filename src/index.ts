import colors from 'colors/safe';

const TRANSFORMS = [
  {
    name: 'Remove console and console calls',
    value: 'remove-console',
  },
  {
    name: 'Remove debugger statements',
    value: 'remove-debugger',
  },
  // YARN PLOP TRANSFORMS
  {
    name: 'Converts a react class component with only a `render()` method into a `React.memo` functional component',
    value: 'convert-react-pure',
  },
  {
    name: 'Convert chained variable declarations to individual declarations',
    value: 'convert-chained-declarations',
  },
  {
    name: 'Convert object spread patterns to Object.assign()',
    value: 'convert-spread-assign',
  },
  {
    name: 'Convert then() promises to async / await',
    value: 'convert-then-async',
  },
  {
    name: 'Convert functions with bind(this) to arrow functions',
    value: 'convert-bind-arrow-function',
  },
  {
    name: 'Convert function expressions to arrow functions while respecting lexical this',
    value: 'convert-function-expression-arrow',
  },
  {
    name: 'Converts variable declarations that are not reassigned from `let` to `const`.',
    value: 'convert-let-const',
  },
  {
    name: 'Converts string concatenation into template literals, including concatenation of strings and variables',
    value: 'convert-concat-strings',
  },
  {
    name: 'Converts object expressions and patterns to shorthand when key and values are the same',
    value: 'convert-object-shorthand',
  },
  {
    name: 'Converts variable declarations to object destructure',
    value: 'convert-object-destructure',
  },
  {
    name: 'Convert template literals without any template elements to string literal',
    value: 'convert-template-literal',
  },
];

function showOptions() {
  console.log(colors.bgRed('\nAvailable transforms:\n'));
  for (const T of TRANSFORMS) {
    console.log(colors.blue(`dist/${T.value}.js:`), `${T.name}`);
  }
  console.log(colors.bgRed('\nUsage:\n'));
  console.log(colors.yellow('\tjscodeshift -t dist/[TRANSFORM FILENAME.js] [YOUR FILE.js]'));
  console.log(colors.bgRed('\nSetup:'));
  console.log(
    '\nPlease install jscodeshift globally via npm due to a known bug with yarn (https://github.com/facebook/jscodeshift/issues/424):'
  );
  console.log(colors.yellow('\n\tnpm install -g jscodeshift\n'));
}

showOptions();
