import { API, BlockStatement, FileInfo, JSCodeshift, MemberExpression, Options } from 'jscodeshift';
import { applyMultipleTransforms } from './utils';

/**
 * KIV:
 * - How to check for then chaining? => thenthen chaining = resolving nested promises = multiple awaits
 * - then, then, catch / finally chaining
 * - then + finally, without catch
 * - let x = await ... if x is reassigned in callback, const x = await if x is never reassigned => can reuse an existing transform?
 * - callback has multiple params, need multiple variable declarator
 */
export default function transform(file: FileInfo, api: API, options: Options): string {
  const transforms = [transformFunctionDeclaration, transformFunctionExpression, transformArrowFunction];

  return applyMultipleTransforms(file, api, transforms, options, undefined);
}

function transformFunctionDeclaration(props: { file: FileInfo; api: API; options: Options }): string {
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

function transformFunctionExpression(props: { file: FileInfo; api: API; options: Options }): string {
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

function transformArrowFunction(props: { file: FileInfo; api: API; options: Options }): string {
  const { file, api } = props;

  const j = api.jscodeshift;

  return j(file.source)
    .find(j.ArrowFunctionExpression)
    .forEach((path) => {
      const { body, params } = path.value;
      if (body.type === 'BlockStatement') {
        const newBody = createBody(body, j);
        if (newBody) {
          const newFn = j.arrowFunctionExpression(params, newBody);
          newFn.async = true;
          j(path).replaceWith(newFn);
        }
      } else if (body.type === 'CallExpression') {
        // TODO: () => a.then()....
      }
    })
    .toSource();
}

function createBody(body: BlockStatement, j: JSCodeshift) {
  const finalStatement = body.body[body.body.length - 1];
  if (
    finalStatement.type === 'ReturnStatement' &&
    finalStatement.argument &&
    finalStatement.argument.type === 'CallExpression' &&
    finalStatement.argument.callee.type === 'MemberExpression' &&
    finalStatement.argument.callee.property.type === 'Identifier'
  ) {
    const {
      argument: {
        callee: { property: finalProperty, object },
        arguments: returnArgs,
      },
    } = finalStatement;

    if (
      returnArgs.length === 1 &&
      (returnArgs[0].type === 'FunctionExpression' || returnArgs[0].type === 'ArrowFunctionExpression')
    ) {
      // TODO: only assuming single then for now
      body.body.pop();
      if (finalProperty.name === 'then') {
        // Add a variable declarator for the await
        body.body.push(
          j.variableDeclaration('const', [j.variableDeclarator(returnArgs[0].params[0], j.awaitExpression(object))])
        );
        // push the remaining then callback
        if (returnArgs[0].body.type === 'BlockStatement') {
          body.body.push(...returnArgs[0].body.body);
        } else {
          body.body.push(j.returnStatement(returnArgs[0].body));
        }

        return body;
      } else if (finalProperty.name === 'catch' && object.type === 'CallExpression') {
        const finalArg = object.arguments[object.arguments.length - 1];
        if (finalArg.type === 'FunctionExpression' || finalArg.type === 'ArrowFunctionExpression') {
          const tryBlock = j.blockStatement([
            j.variableDeclaration('const', [
              j.variableDeclarator(finalArg.params[0], j.awaitExpression((object.callee as MemberExpression).object)),
            ]),
          ]);
          if (finalArg.body.type === 'BlockStatement') {
            tryBlock.body.push(...finalArg.body.body);
          } else {
            tryBlock.body.push(j.returnStatement(finalArg.body));
          }

          const catchBlock = j.blockStatement([]);
          if (returnArgs[0].body.type === 'BlockStatement') {
            catchBlock.body.push(...returnArgs[0].body.body);
          } else {
            catchBlock.body.push(j.returnStatement(returnArgs[0].body));
          }
          body.body.push(
            j.tryStatement(
              tryBlock,
              j.catchClause(
                // params
                returnArgs[0].params[0],
                null,
                catchBlock
              )
            )
          );
          return body;
        }
      }
    }
  }
}
