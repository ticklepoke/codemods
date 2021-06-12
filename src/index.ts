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
  console.log('Available transforms: \n');
  for (const T of TRANSFORMS) {
    console.log(`dist/${T.value}.js: \t ${T.name}`);
  }
  console.log('\nUsage: jscodeshift -t dist/[TRANSFORM FILENAME.js] [YOUR FILE.js]');
  console.log(
    '\nPlease install jscodeshift globally via npm due to a known bug with yarn (https://github.com/facebook/jscodeshift/issues/424): \n\n\tnpm install -g jscodeshift\n'
  );
}

showOptions();
