import { API, FileInfo } from 'jscodeshift';

export default function transform(file: FileInfo, api: API): string {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.TemplateLiteral)
    .forEach((path) => {
      const { value } = path;
      if (value.expressions.length === 0) {
        j(path).replaceWith(j.literal(value.quasis[0].value.raw));
      }
    })
    .toSource({
      quote: 'single',
    });
}
