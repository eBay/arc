let AdaptiveFS = require('./index');
let MemoryFS = require('memory-fs');
let expect = require('chai').expect;

describe('AdaptiveFS', () => {
  it('reads adapted file', () => {
    let mfs = new MemoryFS();
    let afs = new AdaptiveFS({ fs: mfs, flags: { test: true } });
    mfs.writeFileSync('/file[test].js', 'Test Contents');
    expect(afs.readFileSync('/file.js', 'utf-8')).to.equal('Test Contents');
  });
  it('resolves adapted file', () => {
    let mfs = new MemoryFS();
    let afs = new AdaptiveFS({ fs: mfs, flags: { test: true } });
    mfs.writeFileSync('/file[test].js', 'Test Contents');
    expect(afs.resolveSync('/file.js')).to.equal('/file[test].js');
  });
  it('has a method to clear the resolver cache', () => {
    let flags = {};
    let mfs = new MemoryFS();
    let afs = new AdaptiveFS({ fs: mfs, flags });

    // add a file and resolve
    flags.before = true;
    mfs.writeFileSync('/file[before].js', 'Test Contents');
    expect(afs.resolveSync('/file.js')).to.equal('/file[before].js');

    // add a new file, but it can't be found because it's using old cache
    flags.after = true;
    delete flags.before;
    mfs.writeFileSync('/file[after].js', 'Test Contents');
    expect(() => afs.resolveSync('/file.js')).to.throw;

    // clear the cache, now the new file can be found
    afs.clearCache();
    expect(afs.resolveSync('/file.js')).to.equal('/file[after].js');
  });
  it('fallsback to the node filesystem', () => {
    let afs = new AdaptiveFS({ flags: {} });
    expect(afs.existsSync(__filename)).to.equal(true);
  });
  it.skip('throws if no flag function is passed', () => {
    expect(() => new AdaptiveFS()).to.throw(/flags/);
  });
});
