import { API, FileInfo } from 'jscodeshift';

export default function transform(file: FileInfo, api: API): string {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.FunctionExpression)
    .filter((path) => j(path).find(j.ThisExpression).size() === 0)
    .forEach((path) => {
      const { params, body } = path.value;

      const singleExpression = body.body.length === 1 && body.body[0].type === 'ReturnStatement';

      let newBody;
      // Handle the case where function only has a single return statement: function () { return 1; } ----> () => 1;
      if (singleExpression && body.body[0].type === 'ReturnStatement' && body.body[0].argument) {
        newBody = body.body[0].argument;
      } else {
        newBody = body;
      }

      j(path).replaceWith(j.arrowFunctionExpression(params, newBody, singleExpression));
    })
    .toSource();
}
