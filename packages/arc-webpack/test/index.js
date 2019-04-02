let webpack = require('webpack');
let expect = require('chai').expect;
let promisify = require('util').promisify;
let AdaptivePlugin = require('../');
let MemoryFS = require('memory-fs');

describe('AdaptivePlugin', () => {
  describe('api', () => {
    it('should throw if no flags are passed', () => {
      expect(() => new AdaptivePlugin()).to.throw(/flags/);
    });
  });

  [
    {
      description: 'fixture (exclusive)',
      entry: require.resolve('./fixture')
    },
    {
      description: 'fixture-with-base',
      entry: require.resolve('./fixture-with-base')
    }
  ].forEach(({ description, entry }) => {
    describe(description, () => {
      it('should work', async () => {
        let compiler = webpack({
          mode: 'none',
          entry: entry,
          output: { path: '/', filename: 'bundle.js' },
          plugins: [new AdaptivePlugin({ flags: { mobile: true } })]
        });
        let fs = (compiler.outputFileSystem = new MemoryFS());
        await promisify(compiler.run).call(compiler);
        let bundle = fs.readFileSync('/bundle.js', 'utf-8');
        expect(bundle).to.not.include(`console.log('desktop')`);
        expect(bundle).to.include(`console.log('mobile')`);
      });
      it('should work', async () => {
        let compiler = webpack({
          mode: 'none',
          entry: entry,
          output: { path: '/', filename: 'bundle.js' },
          plugins: [new AdaptivePlugin({ flags: { desktop: true } })]
        });
        let fs = (compiler.outputFileSystem = new MemoryFS());
        await promisify(compiler.run).call(compiler);
        let bundle = fs.readFileSync('/bundle.js', 'utf-8');
        expect(bundle).to.include(`console.log('desktop')`);
        expect(bundle).to.not.include(`console.log('mobile')`);
      });
      it('should bundle proxies for the server', async () => {
        let compiler = webpack({
          mode: 'none',
          target: 'async-node',
          entry: entry,
          output: { path: '/', filename: 'bundle.js', libraryTarget: 'commonjs2' },
          externals: [/^[^./!]/],
          module: {
            rules: [
              {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env']
                  }
                }
              }
            ]
          },
          plugins: [new AdaptivePlugin({ proxy: true })]
        });
        let fs = (compiler.outputFileSystem = new MemoryFS());
        await promisify(compiler.run).call(compiler);
        let bundle = fs.readFileSync('/bundle.js', 'utf-8');
        expect(bundle).to.include(`console.log('desktop')`);
        expect(bundle).to.include(`console.log('mobile')`);
        expect(bundle).to.include(`new Proxy`);
      });
    });
  });
});
