import { ExpressionKind } from 'ast-types/gen/kinds';
import { API, BlockStatement, FileInfo } from 'jscodeshift';

export default function transform(file: FileInfo, api: API): string {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression)
    .forEach((path) => {
      const { callee, arguments: args } = path.value;
      if (
        callee.type === 'MemberExpression' &&
        callee.object.type === 'FunctionExpression' &&
        callee.property.type === 'Identifier' &&
        callee.property.name === 'bind' &&
        args.length === 1 &&
        args[0].type === 'ThisExpression'
      ) {
        const { body, params, async: isAsync, generator: isGenerator } = callee.object;
        if (isGenerator) {
          return;
        }

        const [newBody, useExpression] = ((): [BlockStatement | ExpressionKind, boolean] => {
          if (body.body.length === 1 && body.body[0].type === 'ReturnStatement' && body.body[0].argument) {
            return [body.body[0].argument, true];
          } else {
            return [body, false];
          }
        })();

        const newFn = j.arrowFunctionExpression(params, newBody, useExpression);
        newFn.async = isAsync;
        j(path).replaceWith(newFn);
      }
    })
    .toSource({ arrowParensAlways: true });
}
