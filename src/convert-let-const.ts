import { StatementKind } from 'ast-types/gen/kinds';
import {
  API,
  BlockStatement,
  ExpressionStatement,
  FileInfo,
  FunctionDeclaration,
  TryStatement,
  VariableDeclaration,
} from 'jscodeshift';
import { MultiTransformParams } from './types';

type Store = Map<string, number[]>;

export default function transform(file: FileInfo, api: API): string {
  const j = api.jscodeshift;

  const store: Store = new Map();
  return j(file.source)
    .find(j.Program)
    .forEach((path) => {
      const { body } = path.value;
      let newBody = handleBody(body, 0, store);
      newBody = convertLetConst(newBody, 0, store);
      path.value.body = newBody;
    })
    .toSource();
}

export function letConstWrapper(props: MultiTransformParams): string {
  const { file, api } = props;
  return transform(file, api);
}

function handleBody(body: StatementKind[], depth: number, store: Store): StatementKind[] {
  return body.map((node, idx) => {
    switch (node.type) {
      case 'VariableDeclaration':
        return handleVariableDeclaration(node, depth, store);
      case 'BlockStatement':
        return handleBlock(node, depth + idx, store);
      case 'ExpressionStatement':
        return handleExpressionStatement(node, depth, store);
      case 'FunctionDeclaration':
        return handleFunctionBlock(node, depth, store);
      case 'TryStatement':
        return handleTryBlock(node, depth, store);
      default:
        return node;
    }
  });
}

function handleVariableDeclaration(node: VariableDeclaration, depth: number, store: Store): VariableDeclaration {
  const { declarations } = node;
  declarations.forEach((decl) => {
    if (decl.type === 'VariableDeclarator') {
      if (decl.id.type === 'Identifier') {
        if (store.has(decl.id.name)) {
          store.get(decl.id.name)?.push(depth);
        } else {
          store.set(decl.id.name, [depth]);
        }
      } else if (decl.id.type === 'ObjectPattern') {
        decl.id.properties.forEach((prop) => {
          if (prop.type === 'Property' && prop.key.type === 'Identifier' && prop.shorthand) {
            if (store.has(prop.key.name)) {
              store.get(prop.key.name)?.push(depth);
            } else {
              store.set(prop.key.name, [depth]);
            }
          }
        });
      } else if (decl.id.type === 'ArrayPattern') {
        decl.id.elements.forEach((el) => {
          if (el?.type === 'Identifier') {
            if (store.has(el.name)) {
              store.get(el.name)?.push(depth);
            } else {
              store.set(el.name, [depth]);
            }
          }
        });
      }
      if (decl.init?.type === 'FunctionExpression') {
        decl.init.body = handleBlock(decl.init.body, depth + 1, store);
      }
      if (decl.init?.type === 'ArrowFunctionExpression') {
        const {
          init: { body },
        } = decl;
        if (body.type === 'BlockStatement') {
          decl.init.body = handleBlock(body, depth + 1, store);
        }
      }
    }
  });
  return node;
}

function handleExpressionStatement(node: ExpressionStatement, depth: number, store: Store): ExpressionStatement {
  const { expression } = node;
  if (expression.type === 'AssignmentExpression' && expression.left.type === 'Identifier') {
    store.get(expression.left.name)?.pop();
  }
  if (expression.type === 'UpdateExpression' && expression.argument.type === 'Identifier') {
    store.get(expression.argument.name)?.pop();
  }
  return node;
}

function handleBlock(node: BlockStatement, depth: number, store: Store): BlockStatement {
  node.body = handleBody(node.body, depth, store);
  node.body = convertLetConst(node.body, depth, store);
  return node;
}

function handleTryBlock(node: TryStatement, depth: number, store: Store): TryStatement {
  node.block = handleBlock(node.block, depth, store);
  return node;
}

function handleFunctionBlock(node: FunctionDeclaration, depth: number, store: Store): FunctionDeclaration {
  node.body = handleBlock(node.body, depth, store);
  return node;
}

function convertLetConst(body: StatementKind[], depth: number, store: Store): StatementKind[] {
  body.forEach((stmt) => {
    if (stmt.type === 'VariableDeclaration') {
      stmt.declarations.forEach((decl) => {
        if (decl.type === 'VariableDeclarator') {
          if (decl.id.type === 'Identifier') {
            if (store.get(decl.id.name)?.includes(depth)) {
              stmt.kind = 'const';
            }
          } else if (decl.id.type === 'ObjectPattern') {
            const inStore = decl.id.properties.every((prop) => {
              if (prop.type === 'Property' && prop.key.type === 'Identifier' && prop.shorthand) {
                if (store.get(prop.key.name)?.includes(depth)) {
                  return true;
                }
              }
              return false;
            });
            if (inStore) {
              stmt.kind = 'const';
            }
          } else if (decl.id.type === 'ArrayPattern') {
            const inStore = decl.id.elements.every((el) => {
              if (el?.type === 'Identifier') {
                if (store.get(el.name)?.includes(depth)) {
                  return true;
                }
                return false;
              }
            });
            if (inStore) {
              stmt.kind = 'const';
            }
          }
        }
      });
    }
  });
  return body;
}
