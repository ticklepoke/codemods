"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = transform;

function transform(file, api) {
  var j = api.jscodeshift;
  return j(file.source).find(j.DebuggerStatement).forEach(function (path) {
    return j(path).remove();
  }).toSource();
}