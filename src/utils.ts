import { API, Collection, FileInfo, Node, Options } from 'jscodeshift';
import { MultiTransformParams } from './types';

export function applyMultipleTransforms<Ctx>(
  file: FileInfo,
  api: API,
  transforms: ((props: MultiTransformParams<Ctx>) => string)[],
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
    newFirstNode.comments = comments;
  }
  return newRoot.toSource();
}

export function peekLast<T>(arr: Array<T>): T {
  return peekLastNth(arr, 0);
}

export function peekLastNth<T>(arr: Array<T>, n: number): T {
  return arr[arr.length - 1 - n];
}
