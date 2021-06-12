import { API, FileInfo, Options } from 'jscodeshift';

export default function transform(file: FileInfo, api: API, options: Options): string {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.BlockStatement)
    .forEach((path) => path)
    .toSource();
}
