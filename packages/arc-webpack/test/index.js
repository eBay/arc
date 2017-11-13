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

  it('should work', async () => {
    let compiler = webpack({
      entry: require.resolve('./fixture'),
      output: { path:'/', filename:'bundle.js' },
      plugins: [new AdaptivePlugin({ flags: () => ({ mobile: true }) })]
    });
    let fs = compiler.outputFileSystem = new MemoryFS();
    await promisify(compiler.run).call(compiler);
    expect(fs.readFileSync('/bundle.js', 'utf-8')).to.include(`console.log('mobile')`);
  });
  it('should work', async () => {
    let compiler = webpack({
      entry: require.resolve('./fixture'),
      output: { path:'/', filename:'bundle.js' },
      plugins: [new AdaptivePlugin({ flags: () => ({ desktop: true }) })]
    });
    let fs = compiler.outputFileSystem = new MemoryFS();
    await promisify(compiler.run).call(compiler);
    expect(fs.readFileSync('/bundle.js', 'utf-8')).to.include(`console.log('desktop')`);
  });
});
