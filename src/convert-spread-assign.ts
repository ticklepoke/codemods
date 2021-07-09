import { namedTypes } from 'ast-types';
import { API, FileInfo, Options } from 'jscodeshift';

type ObjectProperties =
  | namedTypes.SpreadElement
  | namedTypes.ObjectProperty
  | namedTypes.Property
  | namedTypes.ObjectMethod
  | namedTypes.SpreadProperty;

export default function transform(file: FileInfo, api: API, options: Options): string {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.ObjectExpression)
    .filter((path) => path.value.properties.some(({ type }) => type === 'SpreadElement'))
    .forEach((path) => {
      // create array of
      const { properties } = path.value;
      let queue: ObjectProperties[] = [];
      const objectAssign = j.callExpression(j.memberExpression(j.identifier('Object'), j.identifier('assign')), [
        j.objectExpression([]),
      ]);
      for (const property of properties) {
        if (property.type === 'SpreadElement') {
          if (queue.length > 0) {
            const objectExpression = j.objectExpression(queue);
            objectAssign.arguments.push(objectExpression);
          }
          if (property.argument.type === 'Identifier') {
            objectAssign.arguments.push(j.identifier(property.argument.name));
          } else if (property.argument.type === 'ObjectExpression') {
            objectAssign.arguments.push(j.objectExpression(property.argument.properties));
          }
          queue = [];
        } else {
          queue.push(property);
        }
      }
      if (queue.length > 0) {
        const objectExpression = j.objectExpression(queue);
        objectAssign.arguments.push(objectExpression);
      }
      j(path).replaceWith(objectAssign);
    })
    .toSource(options);
}
