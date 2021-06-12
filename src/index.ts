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
];

function showOptions() {
  console.log(colors.bgRed('\nAvailable transforms:\n'));
  for (const T of TRANSFORMS) {
    console.log(colors.blue(`dist/${T.value}.js:`), `\t ${T.name}`);
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
