import { API, FileInfo, Options } from 'jscodeshift';
import { applyMultipleTransforms } from './utils';

/**
 * 1. Check if return statement has a member expression .then()
 * 2. Check if theres a catch block
 *  - Try block: initial member expression + then block
 *  - Callback in then block has to be unwrapped
 * 3. Check if theres a finally block
 * 4. Check for single return of arrow functions => need to expand into a full return statement
 *
 * KIV:
 * - How to check for then chaining?
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
      const { body, id, params } = path.value;
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
          finalProperty.name === 'then' &&
          returnArgs.length === 1 &&
          (returnArgs[0].type === 'FunctionExpression' || returnArgs[0].type === 'ArrowFunctionExpression')
        ) {
          // TODO: only assuming single then for now

          body.body.pop();
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
          // if callback returns single line, create a return statement
          const newFn = j.functionDeclaration(id, params, body);
          newFn.async = true;
          j(path).replaceWith(newFn);
        } else if (finalProperty.name === 'catch') {
          console.log('TODO: catch');
        } else if (finalProperty.name === 'finally') {
          console.log('TODO: finally');
        }
      }
    })
    .toSource();
}

function transformFunctionExpression(props: { file: FileInfo; api: API; options: Options }): string {
  const { file, api } = props;

  const j = api.jscodeshift;

  return j(file.source).find(j.FunctionExpression).toSource();
}

function transformArrowFunction(props: { file: FileInfo; api: API; options: Options }): string {
  const { file, api } = props;

  const j = api.jscodeshift;

  return j(file.source).find(j.ArrowFunctionExpression).toSource();
}
