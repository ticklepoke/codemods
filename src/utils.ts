import { API, FileInfo, Options } from 'jscodeshift';

export function applyMultipleTransforms<Ctx>(
  file: FileInfo,
  api: API,
  transforms: ((props: { file: FileInfo; api: API; options: Options; context: Ctx }) => string)[],
  options: Options,
  context: Ctx
): string {
  let { source } = file;

  transforms.forEach((trf) => {
    if (typeof source === 'undefined') return;
    const nextSource = trf({ file: { ...file, source }, api, options, context });

    if (nextSource) {
      source = nextSource;
    }
  });
  return source;
}
