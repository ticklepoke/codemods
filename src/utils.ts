import { API, Collection, FileInfo, Node, Options } from 'jscodeshift';

export function applyMultipleTransforms<Ctx>(
  file: FileInfo,
  api: API,
  transforms: ((props: { file: FileInfo; api: API; options: Options; context: Ctx }) => string)[],
  options: Options,
  context: Ctx
): string {
  let { source } = file;
  const j = api.jscodeshift;
  const root = j(source);
  function getFirstNode(root: Collection<unknown>) {
    return root.find(j.Program).get('body', 0).node as Node;
  }
  const firstNode = getFirstNode(root);
  const { comments } = firstNode;

  transforms.forEach((trf) => {
    if (typeof source === 'undefined') return;
    const nextSource = trf({ file: { ...file, source }, api, options, context });

    if (nextSource) {
      source = nextSource;
    }
  });

  const newRoot = j(source);
  const newFirstNode = getFirstNode(newRoot);
  if (firstNode !== newFirstNode) {
    console.log('here');
    newFirstNode.comments = comments;
  }
  return newRoot.toSource();
}
