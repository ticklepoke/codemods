"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = transform;

var _utils = require("./utils");

function transform(file, api, options) {
  var transforms = [removeDestructuredConsoleDecl, removeCopiedConsoleDecl, removeCallExpressionConsole];
  var destructuredVariables = new Set();
  return (0, _utils.applyMultipleTransforms)(file, api, transforms, options, {
    destructuredVariables: destructuredVariables
  });
}

function removeCallExpressionConsole(props) {
  var file = props.file,
      api = props.api,
      destructuredVariables = props.context.destructuredVariables;
  var j = api.jscodeshift;
  return j(file.source).find(j.ExpressionStatement).forEach(function (path) {
    var expression = path.value.expression;

    if (expression.type === 'CallExpression') {
      var callee = expression.callee;

      if (callee.type === 'MemberExpression') {
        if (callee.object.type === 'Identifier') {
          if (callee.object.type === 'Identifier') {
            if (callee.object.name === 'console') {
              j(path).remove();
            }
          }
        }
      } else if (callee.type === 'Identifier') {
        if (destructuredVariables.has(callee.name)) {
          j(path).remove();
        }
      }
    }
  }).toSource();
}

function removeDestructuredConsoleDecl(props) {
  var file = props.file,
      api = props.api,
      destructuredVariables = props.context.destructuredVariables;
  var j = api.jscodeshift;
  return j(file.source).find(j.VariableDeclaration).forEach(function (path) {
    var declarations = path.value.declarations;
    var isDestructuredFromConsole = declarations.some(function (decl) {
      if (decl.type === 'VariableDeclarator') {
        var _decl$init;

        if (((_decl$init = decl.init) === null || _decl$init === void 0 ? void 0 : _decl$init.type) === 'Identifier') {
          if (decl.init.name === 'console') {
            if (decl.id.type === 'ObjectPattern') {
              decl.id.properties.forEach(function (prop) {
                if (prop.type === 'Property') {
                  if (prop.key.name === prop.value.name) {
                    destructuredVariables.add(prop.key.name);
                  } else {
                    destructuredVariables.add(prop.value.name);
                  }
                }
              });
            }

            return true;
          }
        }
      }

      return false;
    });

    if (isDestructuredFromConsole) {
      j(path).remove();
    }
  }).toSource();
}

function removeCopiedConsoleDecl(props) {
  var file = props.file,
      api = props.api,
      destructuredVariables = props.context.destructuredVariables;
  var j = api.jscodeshift;
  return j(file.source).find(j.VariableDeclaration).forEach(function (path) {
    var declarations = path.value.declarations;
    var isReassignedFromDestructuredConsole = declarations.some(function (decl) {
      if (decl.type === 'VariableDeclarator') {
        var _decl$init2;

        if (((_decl$init2 = decl.init) === null || _decl$init2 === void 0 ? void 0 : _decl$init2.type) === 'Identifier') {
          if (destructuredVariables.has(decl.init.name) && decl.id.type === 'Identifier') {
            console.log(decl.id.name);
            destructuredVariables.add(decl.id.name);
            return true;
          }
        }
      }
    });

    if (isReassignedFromDestructuredConsole) {
      j(path).remove();
    }
  }).toSource();
}