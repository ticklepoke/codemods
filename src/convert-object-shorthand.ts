import { API, FileInfo } from 'jscodeshift';

export default function transform(file: FileInfo, api: API): string {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.Property)
    .forEach((path) => {
      const { key, value } = path.value;
      if (key.type === 'Identifier' && value.type === 'Identifier') {
        path.value.shorthand = key.name === value.name;
      }
    })
    .toSource();
}
