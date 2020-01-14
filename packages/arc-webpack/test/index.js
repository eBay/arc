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
      it('should bundle only the adapted files (mobile)', async () => {
        let compiler = webpack({
          mode: 'none',
          entry: entry,
          module: {
            rules: [{
              test: /\.css$/,
              use: [
                'style-loader',
                'css-loader'
              ]
            }]
          },
          output: { path: '/', filename: 'bundle.js' },
          plugins: [new AdaptivePlugin({ flags: { mobile: true } })]
        });
        let fs = (compiler.outputFileSystem = new MemoryFS());
        await promisify(compiler.run).call(compiler);
        let bundle = fs.readFileSync('/bundle.js', 'utf-8');
        expect(bundle).to.not.include(`console.log('desktop')`);
        expect(bundle).to.include(`console.log('mobile')`);
        expect(bundle).to.not.include(`content: 'desktop';`);
        expect(bundle).to.include(`content: 'mobile';`);
      });
      it('should bundle only the adapted files (desktop)', async () => {
        let compiler = webpack({
          mode: 'none',
          entry: entry,
          module: {
            rules: [{
              test: /\.css$/,
              use: [
                "style-loader", 
                "css-loader",
              ]
            }]
          },
          output: { path: '/', filename: 'bundle.js' },
          plugins: [new AdaptivePlugin({ flags: { desktop: true } })]
        });
        let fs = (compiler.outputFileSystem = new MemoryFS());
        await promisify(compiler.run).call(compiler);
        let bundle = fs.readFileSync('/bundle.js', 'utf-8');
        expect(bundle).to.include(`console.log('desktop')`);
        expect(bundle).to.not.include(`console.log('mobile')`);
        expect(bundle).to.include(`content: 'desktop';`);
        expect(bundle).to.not.include(`content: 'mobile';`);
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
      it('should allow things to touch the original inputFileSystem', async () => {
        let compiler = webpack({
          mode: 'none',
          entry: entry,
          output: { path: '/', filename: 'bundle.js' },
          plugins: [
            new AdaptivePlugin({ flags: { desktop: true } }),
            (compiler) => {
              const fs = compiler.inputFileSystem;
              expect(fs.purge).to.be.a('function');
              fs.foo = 123;
              expect(fs.foo).to.be.equal(123);
            }
          ]
        });
        let fs = (compiler.outputFileSystem = new MemoryFS());
        await promisify(compiler.run).call(compiler);
        let bundle = fs.readFileSync('/bundle.js', 'utf-8');
        expect(bundle).to.include(`console.log('desktop')`);
        expect(bundle).to.not.include(`console.log('mobile')`);
      });
      
      // it('should give a non-arc stacktrace when file is missing', async () => {
      //   let compiler = webpack({
      //     mode: 'none',
      //     target: 'async-node',
      //     entry: entry,
      //     plugins: [new AdaptivePlugin({ proxy: true })]
      //   });
      //   let fs = (compiler.outputFileSystem = new MemoryFS());
      //   let stats = await promisify(compiler.run).call(compiler);
      //   let errors = stats.compilation.errors;
      //   expect(errors.length).to.equal(1);
      // });
    });
  });
});
