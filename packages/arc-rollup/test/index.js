let rollup = require('rollup');
let commonjs = require('rollup-plugin-commonjs');
let builtins = require("builtin-modules");
let expect = require('chai').expect;
let resolve = require('../');

describe('resolve', () => {
  describe('api', () => {
    it('should throw if no flags are passed', () => {
      expect(() => resolve()).to.throw(/flags/);
    });
  });

  [
    {
      description: 'fixture (exclusive)',
      input: require.resolve('./fixture')
    },
    {
      description: 'fixture-with-base',
      input: require.resolve('./fixture-with-base')
    }
  ].forEach(({ description, input }) => {
    describe(description, () => {
      it('should work', async () => {
        const bundle = await rollup.rollup({
          input,
          plugins: [resolve({ flags: { mobile: true } })]
        });
        const { output:[{ code }] } = await bundle.generate({ format: "iife" });
        expect(code).to.not.include(`console.log('desktop')`);
        expect(code).to.include(`console.log('mobile')`);
      });
      it('should work', async () => {
        const bundle = await rollup.rollup({
          input,
          plugins: [resolve({ flags: { desktop: true } })]
        });
        const { output:[{ code }] } = await bundle.generate({ format: "iife" });
        expect(code).to.include(`console.log('desktop')`);
        expect(code).to.not.include(`console.log('mobile')`);
      });
      it('should bundle proxies for the server', async () => {
        const bundle = await rollup.rollup({
          input,
          plugins: [
            resolve({ proxy: true }),
            commonjs()
          ],
          external: builtins
        });
        const { output:[{ code }] } = await bundle.generate({ format: "esm" });
        expect(code).to.include(`console.log('desktop')`);
        expect(code).to.include(`console.log('mobile')`);
        expect(code).to.include(`new Proxy`);
      });
    });
  });
});
