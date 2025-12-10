module.exports = {
  default: {
    require: ['tests/e2e/steps/**/*.ts', 'tests/e2e/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress'],
    paths: ['spec/bdd/*.feature'],
    publishQuiet: true
  }
};
