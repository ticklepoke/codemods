import { API, FileInfo, Identifier, MemberExpression, Options } from 'jscodeshift';
import { applyMultipleTransforms } from './utils';

export interface Context {
  destructuredVariables: Set<string>;
}

export default function transform(file: FileInfo, api: API, options: Options): string {
  const transforms = [removeDestructuredConsoleDecl, removeCopiedConsoleDecl, removeCallExpressionConsole];
  const destructuredVariables = new Set<string>();

  return applyMultipleTransforms<Context>(file, api, transforms, options, { destructuredVariables });
}

function removeCallExpressionConsole(props: { file: FileInfo; api: API; options: Options; context: Context }): string {
  const {
    file,
    api,
    context: { destructuredVariables },
  } = props;
  const j = api.jscodeshift;

  console.log(destructuredVariables);
  return j(file.source)
    .find(j.ExpressionStatement)
    .forEach((path) => {
      const { expression } = path.value;
      if (expression.type === 'CallExpression') {
        const { callee } = expression;
        if (callee.type === 'MemberExpression') {
          if ((callee as MemberExpression).object.type === 'Identifier') {
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
    })
    .toSource();
}

function removeDestructuredConsoleDecl(props: { file: FileInfo; api: API; context: Context }): string {
  const {
    file,
    api,
    context: { destructuredVariables },
  } = props;
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.VariableDeclaration)
    .forEach((path) => {
      const { declarations } = path.value;
      const isDestructuredFromConsole = declarations.some((decl) => {
        if (decl.type === 'VariableDeclarator') {
          if (decl.init?.type === 'Identifier') {
            if (decl.init.name === 'console') {
              if (decl.id.type === 'ObjectPattern') {
                decl.id.properties.forEach((prop) => {
                  if (prop.type === 'Property') {
                    if ((prop.key as Identifier).name === (prop.value as Identifier).name) {
                      destructuredVariables.add((prop.key as Identifier).name);
                    } else {
                      destructuredVariables.add((prop.value as Identifier).name);
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
    })
    .toSource();
}

function removeCopiedConsoleDecl(props: { file: FileInfo; api: API; context: Context }): string {
  const {
    file,
    api,
    context: { destructuredVariables },
  } = props;

  const j = api.jscodeshift;

  return j(file.source)
    .find(j.VariableDeclaration)
    .forEach((path) => {
      const { declarations } = path.value;
      const isReassignedFromDestructuredConsole = declarations.some((decl) => {
        if (decl.type === 'VariableDeclarator') {
          if (decl.init?.type === 'Identifier') {
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
    })
    .toSource();
}
