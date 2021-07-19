import { ExpressionKind, IdentifierKind, StatementKind } from 'ast-types/gen/kinds';
import {
  API,
  ClassMethod,
  ClassPrivateMethod,
  ClassPrivateProperty,
  ClassProperty,
  ClassPropertyDefinition,
  FileInfo,
  MethodDefinition,
  Options,
  TSCallSignatureDeclaration,
  TSConstructSignatureDeclaration,
  TSDeclareMethod,
  TSIndexSignature,
  TSMethodSignature,
  TSPropertySignature,
  VariableDeclarator,
} from 'jscodeshift';
import { MultiTransformParams } from './types';
import { applyMultipleTransforms } from './utils';

type BodyMethods =
  | VariableDeclarator
  | MethodDefinition
  | ClassPropertyDefinition
  | ClassProperty
  | ClassPrivateProperty
  | ClassMethod
  | ClassPrivateMethod
  | TSDeclareMethod
  | TSCallSignatureDeclaration
  | TSConstructSignatureDeclaration
  | TSIndexSignature
  | TSMethodSignature
  | TSPropertySignature;

export default function transform(file: FileInfo, api: API, options: Options): string {
  const transforms = [removeThisDestructure, convertClassToFunctional, removeThisReference];
  return applyMultipleTransforms(file, api, transforms, options, null);
}
function removeThisDestructure(props: MultiTransformParams) {
  const { file, api } = props;
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.VariableDeclarator)
    .filter(({ value: { init } }) => init?.type === 'ThisExpression')
    .forEach((path) => {
      j(path).remove();
    })
    .toSource();
}

function removeThisReference(props: MultiTransformParams) {
  const { file, api } = props;
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.MemberExpression)
    .filter(({ value: { object } }) => object.type === 'ThisExpression')
    .forEach((path) => {
      const { property } = path.value;
      j(path).replaceWith(property);
    })
    .toSource();
}

function convertClassToFunctional(props: MultiTransformParams) {
  const { file, api } = props;
  const j = api.jscodeshift;

  function createReactionFunctionalComponent(
    className: IdentifierKind,
    returnBody: ExpressionKind | null,
    renderBody?: StatementKind[]
  ) {
    const innerFnReturn = j.returnStatement(returnBody);
    const innerFn = j.functionExpression(
      null,
      [j.identifier('props')],
      j.blockStatement([...(renderBody ?? []), innerFnReturn])
    );
    const reactMemoCallee = j.memberExpression(j.identifier('React'), j.identifier('memo'));
    const reactMemoCall = j.callExpression(reactMemoCallee, [innerFn]);
    const varDeclarator = j.variableDeclarator(className, reactMemoCall);
    const varDeclaration = j.variableDeclaration('const', [varDeclarator]);
    return varDeclaration;
  }

  return j(file.source)
    .find(j.ClassDeclaration)
    .filter(
      ({
        value: {
          superClass,
          body: { body },
        },
      }) => isReactComponentSuperClass(superClass) && isBodyOnlyRender(body)
    )
    .forEach((path) => {
      const {
        body: { body },
        id: className,
      } = path.value;

      if (!className) {
        return;
      }

      if (body[0].type === 'MethodDefinition' || body[0].type === 'ClassProperty') {
        if (body[0].value && body[0].value.type === 'FunctionExpression') {
          const functionBody = body[0].value.body.body;
          const lastStatement = functionBody[functionBody.length - 1];
          if (lastStatement.type === 'ReturnStatement') {
            // TODO: remove all const { } = this in another transform
            const varDeclaration = createReactionFunctionalComponent(
              className,
              lastStatement.argument,
              functionBody.slice(0, functionBody.length - 1)
            );
            j(path).replaceWith(varDeclaration);
          }
        } else if (body[0].value && body[0].value.type === 'ArrowFunctionExpression') {
          if (body[0].value.body.type === 'BlockStatement') {
            const functionBody = body[0].value.body.body;
            const lastStatement = functionBody[functionBody.length - 1];
            if (lastStatement.type === 'ReturnStatement') {
              const varDeclaration = createReactionFunctionalComponent(
                className,
                lastStatement.argument,
                functionBody.slice(0, functionBody.length - 1)
              );
              j(path).replaceWith(varDeclaration);
            }
          } else if (body[0].value.body.type === 'JSXElement') {
            const varDeclaration = createReactionFunctionalComponent(className, body[0].value.body);
            j(path).replaceWith(varDeclaration);
          }
        }
      }
    })
    .toSource();
}

function isReactComponentSuperClass(superClass: ExpressionKind | undefined | null) {
  if (!superClass) return false;
  if (
    superClass.type === 'MemberExpression' &&
    superClass.object.type === 'Identifier' &&
    superClass.property.type === 'Identifier'
  ) {
    return (
      superClass.object.name === 'React' &&
      (superClass.property.name === 'Component' || superClass.property.name === 'PureComponent')
    );
  }
  if (superClass.type === 'Identifier') {
    return superClass.name === 'Component' || superClass.name === 'PureComponent';
  }
  return false;
}

function isBodyOnlyRender(body: BodyMethods[]) {
  return (
    body.length === 1 &&
    (body[0].type === 'MethodDefinition' || body[0].type === 'ClassProperty') &&
    body[0].key.type === 'Identifier' &&
    body[0].key.name === 'render'
  );
}
