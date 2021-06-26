import { API, BlockStatement, CallExpression, FileInfo, JSCodeshift, Options, TryStatement } from 'jscodeshift';
import { letConstWrapper } from './convert-let-const';
import { MultiTransformParams } from './types';
import { applyMultipleTransforms, peekLast } from './utils';

/**
 * KIV:
 * - callback has multiple params, need multiple variable declarator
 */
export default function transform(file: FileInfo, api: API, options: Options): string {
  const transforms = [
    transformFunctionDeclaration,
    transformFunctionExpression,
    transformArrowFunction,
    letConstWrapper,
  ];

  return applyMultipleTransforms(file, api, transforms, options, null);
}

function transformFunctionDeclaration(props: MultiTransformParams): string {
  const { file, api } = props;

  const j = api.jscodeshift;

  return j(file.source)
    .find(j.FunctionDeclaration)
    .forEach((path) => {
      const { body, id, params, generator: isGenerator } = path.value;
      const newBody = createBody(body, j);
      if (newBody) {
        const newFn = j.functionDeclaration(id, params, newBody);
        newFn.async = true;
        newFn.generator = isGenerator;
        j(path).replaceWith(newFn);
      }
    })
    .toSource();
}

function transformFunctionExpression(props: MultiTransformParams): string {
  const { file, api } = props;

  const j = api.jscodeshift;

  return j(file.source)
    .find(j.FunctionExpression)
    .forEach((path) => {
      const { body, id, params, generator: isGenerator } = path.value;
      const newBody = createBody(body, j);
      if (newBody) {
        const newFn = j.functionExpression(id, params, newBody);
        newFn.async = true;
        newFn.generator = isGenerator;
        j(path).replaceWith(newFn);
      }
    })
    .toSource();
}

function transformArrowFunction(props: MultiTransformParams): string {
  const { file, api } = props;

  const j = api.jscodeshift;

  return j(file.source)
    .find(j.ArrowFunctionExpression)
    .forEach((path) => {
      const { body, params } = path.value;
      if (body.type === 'BlockStatement' || body.type === 'CallExpression') {
        const newBody = createBody(body, j);
        if (newBody) {
          const newFn = j.arrowFunctionExpression(params, newBody);
          newFn.async = true;
          j(path).replaceWith(newFn);
        }
      }
    })
    .toSource();
}

function createBody(body: BlockStatement | CallExpression, j: JSCodeshift) {
  if (body.type === 'BlockStatement') {
    const finalStatement = peekLast(body.body);
    if (
      finalStatement.type === 'ReturnStatement' &&
      finalStatement.argument &&
      finalStatement.argument.type === 'CallExpression' &&
      finalStatement.argument.callee.type === 'MemberExpression' &&
      finalStatement.argument.callee.property.type === 'Identifier'
    ) {
      body.body.pop();
      traverse(finalStatement.argument, body);
      return body;
    }
  } else {
    const newBody = j.blockStatement([]);
    traverse(body, newBody);
    return newBody;
  }

  function traverse(currentNode: CallExpression, body: BlockStatement) {
    const { callee } = currentNode;

    if (callee.type !== 'MemberExpression' || callee.property.type !== 'Identifier') {
      return;
    }

    if (callee.object.type === 'CallExpression') {
      switch (callee.property.name) {
        case 'finally':
          traverse(callee.object, body);
          handleFinally(currentNode, body);
          return;

        case 'catch':
          traverse(callee.object, body);
          handleCatch(currentNode, body);
          return;

        case 'then':
          traverse(callee.object, body);
          handleThen(currentNode, body);
          return;

        default:
          console.log('Unsupported syntax');
          return;
      }
    } else if (callee.object.type === 'Identifier') {
      handleThen(currentNode, body);
    }
  }

  function handleFinally(node: CallExpression, body: BlockStatement) {
    if (node.callee.type !== 'MemberExpression') {
      return;
    }

    if (node.callee.property.type !== 'Identifier') {
      return;
    }

    if (node.arguments.length !== 1) {
      return;
    }

    if (node.arguments[0].type !== 'ArrowFunctionExpression' && node.arguments[0].type !== 'FunctionExpression') {
      return;
    }

    const finallyFn = node.arguments[0];

    // If there is currently a try/catch
    if (peekLast(body.body).type === 'TryStatement') {
      const tryStatement = peekLast(body.body) as TryStatement;
      if (finallyFn.body.type === 'BlockStatement') {
        tryStatement.finalizer = j.blockStatement(finallyFn.body.body);
      } else {
        tryStatement.finalizer = j.blockStatement([j.returnStatement(finallyFn.body)]);
      }
    } else {
      // TODO: only a then block, need to create a new try/finally
    }
  }

  function handleCatch(node: CallExpression, body: BlockStatement) {
    if (
      node.arguments.length === 1 &&
      (node.arguments[0].type === 'ArrowFunctionExpression' || node.arguments[0].type === 'FunctionExpression') &&
      node.arguments[0].params.length === 1
    ) {
      const catchFn = node.arguments[0];
      const N = body.body.length - 1;
      let i;

      for (i = 0; i < N; i++) {
        if (body.body[i].type === 'VariableDeclaration') {
          break;
        }
      }

      const tryBody = j.blockStatement(body.body.slice(i));
      const catchBody = j.blockStatement([]);
      if (catchFn.body.type === 'BlockStatement') {
        catchBody.body.push(...catchFn.body.body);
      } else {
        catchBody.body.push(j.returnStatement(catchFn.body));
      }

      body.body = body.body.slice(0, i);
      body.body.push(
        j.tryStatement(
          tryBody,
          j.catchClause(
            // catch params
            catchFn.params[0],
            null,
            catchBody
          )
        )
      );
      return;
    }
  }

  function handleThen(node: CallExpression, body: BlockStatement) {
    if (node.callee.type !== 'MemberExpression') {
      return;
    }
    if (
      node.callee.object.type === 'CallExpression' &&
      node.callee.object.callee.type === 'MemberExpression' &&
      node.callee.object.callee.property.type === 'Identifier' &&
      node.callee.object.callee.property.name === 'then'
    ) {
      // TODO: if final statement is a return of a previous then block, need to pop off
      const prevThen = body.body.pop();
      if (
        prevThen?.type === 'ReturnStatement' &&
        prevThen.argument?.type === 'Identifier' &&
        node.arguments.length === 1 &&
        (node.arguments[0].type === 'ArrowFunctionExpression' || node.arguments[0].type === 'FunctionExpression') &&
        node.arguments[0].params[0].type === 'Identifier'
      ) {
        const nextAwait = j.variableDeclaration('let', [
          j.variableDeclarator(node.arguments[0].params[0], j.awaitExpression(prevThen.argument)),
        ]);
        body.body.push(nextAwait);
        body.body.push(j.returnStatement(node.arguments[0].params[0]));
      }
    } else {
      const { arguments: callbackArgs } = node;
      if (
        callbackArgs.length === 1 &&
        (callbackArgs[0].type === 'FunctionExpression' || callbackArgs[0].type === 'ArrowFunctionExpression')
      ) {
        body.body.push(
          j.variableDeclaration('let', [
            j.variableDeclarator(callbackArgs[0].params[0], j.awaitExpression(node.callee.object)),
          ])
        );
        if (callbackArgs[0].body.type === 'BlockStatement') {
          body.body.push(...callbackArgs[0].body.body);
        } else {
          body.body.push(j.returnStatement(callbackArgs[0].body));
        }
        return;
      }
    }
  }
}
