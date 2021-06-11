module.exports = function (plop) {
  plop.setGenerator('transform', {
    description: 'Add a new transform',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'transform name please',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/{{name}}.ts',
        templateFile: 'plop-templates/transform.ts',
      },
      {
        type: 'add',
        path: 'src/__tests__/{{name}}.test.ts',
        templateFile: 'plop-templates/transform.test.ts',
      },
      {
        type: 'add',
        path: 'src/__testfixtures__/{{name}}.intput.js',
        templateFile: 'plop-templates/transform.fixture.ts',
      },
      {
        type: 'add',
        path: 'src/__testfixtures__/{{name}}.output.js',
        templateFile: 'plop-templates/transform.fixture.ts',
      },
    ],
  });
};
