import Ajv from 'ajv';
import inputSchema from '../../spec/domain/generate-input.schema.json';
import outputSchema from '../../spec/domain/artifacts.schema.json';

const ajv = new Ajv({ allErrors: true, strict: false });

test('valid input passes', () => {
  const validate = ajv.compile(inputSchema);
  expect(validate({ question: 'Future of EVs in NYC by 2030?', horizon: 24 })).toBe(true);
});

test('invalid output fails when bullets < 6', () => {
  const validate = ajv.compile(outputSchema);
  const bad = {
    quick_take: {
      one_line: 'ok',
      bullets: ['a', 'b'],
      confidence: 'med',
      assumptions: ['x', 'y']
    },
    cones: [],
    signals_drivers: { signals: [], drivers: [] },
    timeline: { milestones: [] },
    moves: { no_regrets: [], options: [], watch_outs: [] }
  };
  expect(validate(bad)).toBe(false);
});
