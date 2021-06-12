"use strict";

var _safe = _interopRequireDefault(require("colors/safe"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var TRANSFORMS = [{
  name: 'Remove console and console calls',
  value: 'remove-console'
}, {
  name: 'Remove debugger statements',
  value: 'remove-debugger'
}, // YARN PLOP TRANSFORMS
{
  name: 'Convert template literals without any template elements to string literal',
  value: 'convert-template-literal'
}];

function showOptions() {
  console.log(_safe["default"].bgRed('\nAvailable transforms:\n'));

  for (var _i = 0, _TRANSFORMS = TRANSFORMS; _i < _TRANSFORMS.length; _i++) {
    var T = _TRANSFORMS[_i];
    console.log(_safe["default"].blue("dist/".concat(T.value, ".js:")), "".concat(T.name));
  }

  console.log(_safe["default"].bgRed('\nUsage:\n'));
  console.log(_safe["default"].yellow('\tjscodeshift -t dist/[TRANSFORM FILENAME.js] [YOUR FILE.js]'));
  console.log(_safe["default"].bgRed('\nSetup:'));
  console.log('\nPlease install jscodeshift globally via npm due to a known bug with yarn (https://github.com/facebook/jscodeshift/issues/424):');
  console.log(_safe["default"].yellow('\n\tnpm install -g jscodeshift\n'));
}

showOptions();