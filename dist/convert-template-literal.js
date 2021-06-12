"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = transform;

function transform(file, api) {
  var j = api.jscodeshift;
  return j(file.source).find(j.TemplateLiteral).forEach(function (path) {
    var value = path.value;

    if (value.expressions.length === 0) {
      j(path).replaceWith(j.literal(value.quasis[0].value.raw));
    }
  }).toSource({
    quote: 'single'
  });
}