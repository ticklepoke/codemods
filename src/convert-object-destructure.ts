import { API, FileInfo, Identifier, Options, Property } from 'jscodeshift';
import { applyMultipleTransforms } from './utils';

interface Context {
  store: Map<string, { key: string; value: string }[]>;
}

export default function transform(file: FileInfo, api: API, options: Options): string {
  const transforms = [convertDeclarationsToDestructure, removeDuplicateDeclarations];
  const store = new Map<string, { key: string; value: string }[]>();

  return applyMultipleTransforms<Context>(file, api, transforms, options, { store });
}

function convertDeclarationsToDestructure(props: {
  file: FileInfo;
  api: API;
  options: Options;
  context: Context;
}): string {
  const {
    file,
    api,
    context: { store },
  } = props;

  const j = api.jscodeshift;

  return j(file.source)
    .find(j.VariableDeclarator)
    .forEach((path) => {
      const { id, init } = path.value;
      if (init && init.type === 'MemberExpression' && id.type === 'Identifier') {
        if (init.property.type === 'Identifier' && init.object.type === 'Identifier') {
          const { property } = init;
          const newProperty = j.property('init', j.identifier(property.name), j.identifier(id.name));
          newProperty.shorthand = property.name === id.name;
          path.value.id = j.objectPattern([newProperty]);

          path.value.init = j.identifier(init.object.name);
          const properties = store.get(init.object.name);
          if (properties) {
            properties.push({ key: init.property.name, value: id.name });
          } else {
            store.set(init.object.name, [{ key: init.property.name, value: id.name }]);
          }
        }
      }
    })
    .toSource({
      objectCurlySpacing: true,
    });
}

function removeDuplicateDeclarations(props: { file: FileInfo; api: API; options: Options; context: Context }): string {
  const {
    file,
    api,
    context: { store },
  } = props;

  const j = api.jscodeshift;

  const seen = new Set();

  return j(file.source)
    .find(j.VariableDeclaration)
    .forEach((path) => {
      const {
        declarations: [declarator],
      } = path.value;
      if (
        declarator.type === 'VariableDeclarator' &&
        declarator.init?.type === 'Identifier' &&
        declarator.id.type === 'ObjectPattern'
      ) {
        const props = store.get(declarator.init.name);
        const { init, id } = declarator;
        if (props && props.length > 1 && !seen.has(init.name)) {
          const [currProp] = id.properties as Property[];

          const newProps = props.map(({ key, value }) => j.property('init', j.identifier(key), j.identifier(value)));

          newProps.forEach((p) => (p.shorthand = (p.key as Identifier).name === (p.value as Identifier).name));
          newProps.filter(({ key }) => (key as Identifier).name !== (currProp.key as Identifier).name);
          id.properties = newProps;
          seen.add(init.name);
        } else if (seen.has(init.name)) {
          j(path).remove();
        }
      }
    })
    .toSource({ tabWidth: 4, useTabs: true });
}
