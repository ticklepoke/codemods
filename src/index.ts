const TRANSFORMS = [
  {
    name: 'Remove console and console calls',
    value: 'remove-console',
  },
  {
    name: 'Remove debugger statements',
    value: 'remove-debugger',
  },
  // YARN PLOP HERE
];

function showOptions() {
  console.log('Available transforms: ');
  for (const T of TRANSFORMS) {
    console.log(T.name, '\n');
  }
  console.log('Usage: jscodeshift -t [transform-filename.js] [your file]');
}

showOptions();
