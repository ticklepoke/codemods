import { API, FileInfo } from 'jscodeshift';

export default function transform(file: FileInfo, api: API): string {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.DebuggerStatement)
    .forEach((path) => j(path).remove())
    .toSource();
}
