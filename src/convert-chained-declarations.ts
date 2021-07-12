import { API, FileInfo } from 'jscodeshift';

export default function transform(file: FileInfo, api: API): string {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.VariableDeclarator)
    .filter(({ value }) => value.init?.type === 'AssignmentExpression')
    .forEach((path) => {
      const { init, id } = path.value;
      if (!(init?.type === 'AssignmentExpression' && id.type === 'Identifier' && init.left.type === 'Identifier')) {
        return;
      }
      const firstVarDecl = j.variableDeclarator(init.left, init.right);
      const secondVarDecl = j.variableDeclarator(id, init.left);
      j(path).replaceWith([firstVarDecl, secondVarDecl]);
    })
    .toSource();
}
