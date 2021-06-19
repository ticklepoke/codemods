import { ExpressionKind } from 'ast-types/gen/kinds';
import core, { API, Collection, FileInfo, Literal, Options, TemplateLiteral } from 'jscodeshift';

export default function transform(file: FileInfo, api: API, options: Options): string {
  const j = api.jscodeshift;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function reverseCollection<T>(collection: Collection<T>): Collection<T> {
    collection.paths().reverse();
    return collection;
  }

  /**
   * Possible nodes:
   * Literal
   * Identifier
   * TemplateLiteral
   * BinaryExpression
   *
   * Implementation:
   *
   * Binary Expression:
   * Recursively edit
   *
   * Literal + (Literal or Identifier):
   * -> Create a new template literal, insert
   *
   * TemplateLiteral + (Literal or Identifier):
   * -> insert into existing template literal
   *
   */
  return reverseCollection(j(file.source).find(j.BinaryExpression))
    .forEach((path) => {
      const { operator } = path.value;
      if (operator !== '+') {
        return;
      }
      const transformedConcat = parseBinaryExpression(path.value, j);
      j(path).replaceWith(transformedConcat);
    })
    .toSource();
}

function parseBinaryExpression(node: ExpressionKind, j: core.JSCodeshift): ExpressionKind {
  if (node.type !== 'BinaryExpression') {
    return node;
  }
  let { left, right } = node;

  if (left.type === 'BinaryExpression') {
    left = parseBinaryExpression(left, j);
  }

  if (right.type === 'BinaryExpression') {
    right = parseBinaryExpression(right, j);
  }

  if (left.type === 'TemplateLiteral' && right.type === 'TemplateLiteral') {
    left.quasis.length > 0 && (left.quasis[left.quasis.length - 1].tail = false);
    left.quasis.push(...right.quasis);
    left.expressions.push(...right.expressions);
    return left;
  } else if (left.type === 'TemplateLiteral') {
    templateLiteralBuilder(left, right, j);
    return left;
  } else if (right.type === 'TemplateLiteral') {
    templateLiteralBuilder(right, left, j);
    return right;
  } else {
    const templateLiteral = j.templateLiteral([], []);
    templateLiteralBuilder(templateLiteral, left, j);
    templateLiteralBuilder(templateLiteral, right, j);
    return templateLiteral;
  }
}

function templateLiteralBuilder(templateLiteral: TemplateLiteral, element: ExpressionKind, j: core.JSCodeshift) {
  if (element.type === 'Literal' && typeof element.value === 'string') {
    templateLiteral.quasis.length > 0 && (templateLiteral.quasis[templateLiteral.quasis.length - 1].tail = false);

    const { value } = element;

    templateLiteral.quasis.push(
      j.templateElement(
        {
          cooked: value, // TODO 19-Jun-2021 Handle escaped characters
          raw: value,
        },
        true
      )
    );
    return;
  }
  if (element.type === 'Literal' || element.type === 'Identifier') {
    templateLiteral.expressions.push(element);
    return;
  }
}
