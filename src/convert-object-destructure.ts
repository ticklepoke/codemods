import { API, BlockStatement, FileInfo, Options, VariableDeclaration, VariableDeclarator } from 'jscodeshift';
import { applyMultipleTransforms } from './utils';

export default function transform(file: FileInfo, api: API, options: Options): string {
  const transforms = [convertDeclarationsToDestructure, removeDuplicateDeclarations];
  return applyMultipleTransforms<undefined>(file, api, transforms, options, undefined);
}

type Store = Map<string, { key: string; value: string }[]>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StatementKind = BlockStatement | VariableDeclaration | any;

function convertDeclarationsToDestructure(props: { file: FileInfo; api: API; options: Options }): string {
  const { file, api } = props;

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
        }
      }
    })
    .toSource({
      objectCurlySpacing: true,
    });
}

function removeDuplicateDeclarations(props: { file: FileInfo; api: API; options: Options }): string {
  const { file, api } = props;

  const j = api.jscodeshift;

  return j(file.source)
    .find(j.Program)
    .forEach((path) => {
      const { body } = path.value;

      const topLevelDecls: Store = new Map();
      scanOutDecls(body, topLevelDecls, api);

      path.value.body = deleteDuplicateDecl(body, topLevelDecls);

      // Handling each block
      j(body)
        .find(j.BlockStatement)
        .forEach((block) => {
          const store = new Map<string, { key: string; value: string }[]>();
          scanOutDecls(block.value.body, store, api);
          j(block).replaceWith(j.blockStatement(deleteDuplicateDecl(block.value.body, store)));
        });
    })
    .toSource({ tabWidth: 4, useTabs: false });
}

function scanOutDecls(body: StatementKind[], store: Store, api: API) {
  const j = api.jscodeshift;
  body.forEach((node) => {
    if (node.type === 'VariableDeclaration') {
      const {
        declarations: [declarator],
      } = node;
      const { id, init } = declarator as VariableDeclarator;
      if (id.type === 'ObjectPattern' && init?.type === 'Identifier') {
        const [property] = id.properties;
        if (property.type === 'Property') {
          const { key, value } = property;
          if (key.type === 'Identifier' && value.type === 'Identifier') {
            const decls = store.get(init.name);
            if (decls) {
              decls.push({
                key: key.name,
                value: value.name,
              });
              id.properties = decls.map((decl) => {
                const prop = j.property('init', j.identifier(decl.key), j.identifier(decl.value));
                prop.shorthand = decl.key === decl.value;
                return prop;
              });
            } else {
              store.set(init.name, [
                {
                  key: key.name,
                  value: value.name,
                },
              ]);
            }
          }
        }
      }
    }
  });
}

function deleteDuplicateDecl(body: StatementKind[], store: Store) {
  return body.filter((node) => {
    if (node.type === 'VariableDeclaration') {
      const {
        declarations: [declarator],
      } = node;
      const { id, init } = declarator as VariableDeclarator;
      if (id.type === 'ObjectPattern' && init?.type === 'Identifier') {
        if (id.properties.length === store.get(init.name)?.length) {
          return true;
        } else {
          return false;
        }
      }
    }
    return true;
  });
}
