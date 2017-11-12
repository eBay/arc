let AdaptiveFS = require('./index');
let MemoryFS = require('memory-fs');
let expect = require('chai').expect;

describe('AdaptiveFS', () => {
  it('reads adapted file', () => {
    let mfs = new MemoryFS();
    let afs = new AdaptiveFS({ fs: mfs, flags: () => ({ test: true }) });
    mfs.writeFileSync('/file[test].js', 'Test Contents');
    expect(afs.readFileSync('/file.js', 'utf-8')).to.equal('Test Contents');
  });
  it('fallsback to the node filesystem', () => {
    let afs = new AdaptiveFS({ flags: () => ({}) });
    expect(afs.existsSync(__filename)).to.equal(true);
  });
  it('throws if no flag function is passed', () => {
    expect(() => new AdaptiveFS()).to.throw(/flags/);
  });
});
