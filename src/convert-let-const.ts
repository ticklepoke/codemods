import { StatementKind } from 'ast-types/gen/kinds';
import {
  API,
  BlockStatement,
  ExpressionStatement,
  FileInfo,
  FunctionDeclaration,
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
      }
      // TODO: handle arrow functions
      if (decl.init?.type === 'ArrowFunctionExpression') {
        const {
          init: { body },
        } = decl;
        if (body.type === 'BlockStatement') {
          decl.init.body = handleBlock(body, depth + 1, store);
        }
        if (body.type === 'AssignmentExpression') {
          // decl.init.body = handleExpressionStatement(decl.init, depth + 1, store);
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

function handleFunctionBlock(node: FunctionDeclaration, depth: number, store: Store): FunctionDeclaration {
  node.body = handleBlock(node.body, depth, store);
  return node;
}

function convertLetConst(body: StatementKind[], depth: number, store: Store): StatementKind[] {
  // console.log(store);
  body.forEach((stmt) => {
    if (stmt.type === 'VariableDeclaration') {
      stmt.declarations.forEach((decl) => {
        if (decl.type === 'VariableDeclarator' && decl.id.type === 'Identifier') {
          if (store.get(decl.id.name)?.includes(depth)) {
            stmt.kind = 'const';
          }
        }
      });
    }
  });
  return body;
}
