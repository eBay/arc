let expect = require('chai').expect;
let Resolver = require('./index');
let MemoryFS = require('memory-fs');

describe('Resolver', () => {
  describe('create', () => {
    it('should throw on invalid filesystem', () => {
      let fs = {};
      expect(() => new Resolver(fs)).to.throw(/filesystem/i);
    });
    it('should throw on null filesystem', () => {
      let fs = null;
      expect(() => new Resolver(fs)).to.throw(/filesystem/i);
    });
    it('should default to node fs', () => {
      new Resolver();
    });
  });

  describe('resolveSync', () => {
    describe('api errors', () => {
      let resolver = new Resolver();

      it('throw when no filepath is passed', () => {
        let filepath = null;
        let flags = { ios: true };
        expect(() => resolver.resolveSync(filepath, flags)).to.throw(
          /filepath/i
        );
      });

      it('throw when no flags are passed', () => {
        let filepath = '/test/foo/file.text';
        let flags = null;
        expect(() => resolver.resolveSync(filepath, flags)).to.throw(/flags/i);
      });

      it('throw if a relative filepath is passed', () => {
        let filepath = './file.text';
        let flags = { ios: true };
        expect(() => resolver.resolveSync(filepath, flags)).to.throw(
          /filepath/i
        );
      });
    });

    describe('resolution', () => {
      it('should resolve existing directories', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.mkdirpSync('/test/foo');

        //test
        let filepath = '/test/foo';
        let flags = { any: true };
        let resolved = resolver.resolveSync(filepath, flags);
        expect(resolved).to.equal('/test/foo');
      });

      it('should resolve existing files', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.writeFileSync('/foo.js', 'contents');

        //test
        let filepath = '/foo.js';
        let flags = { any: true };
        let resolved = resolver.resolveSync(filepath, flags);
        expect(resolved).to.equal('/foo.js');
      });

      it('should resolve existing dotfiles', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.writeFileSync('/.eslintrc', 'contents');

        //test
        let filepath = '/.eslintrc';
        let flags = { any: true };
        let resolved = resolver.resolveSync(filepath, flags);
        expect(resolved).to.equal('/.eslintrc');
      });

      it('should resolve adapted directories', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.mkdirpSync('/test/foo');
        fs.mkdirpSync('/test.flag/foo');

        //test
        let filepath = '/test/foo';
        let flags = { flag: true };
        let resolved = resolver.resolveSync(filepath, flags);
        expect(resolved).to.equal('/test.flag/foo');
      });

      it('should resolve adapted dotfiles', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.writeFileSync('/.eslintrc', 'contents');
        fs.writeFileSync('/.eslintrc.production', 'contents');

        //test
        let filepath = '/.eslintrc';
        let flags = { production: true };
        let resolved = resolver.resolveSync(filepath, flags);
        expect(resolved).to.equal('/.eslintrc.production');
      });

      it('should resolve multiple levels', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.mkdirpSync('/foo/bar');
        fs.mkdirpSync('/foo.mobile/bar');
        fs.writeFileSync('/foo.mobile/bar/index.js', 'contents');
        fs.writeFileSync('/foo.mobile/bar/index.ios.js', 'contents');

        //test
        let filepath = '/foo/bar/index.js';
        let flags = { mobile: true, ios: true };
        let resolved = resolver.resolveSync(filepath, flags);
        expect(resolved).to.equal('/foo.mobile/bar/index.ios.js');
      });

      it('should give priority to the most flags', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.writeFileSync('/file.js', 'contents');
        fs.writeFileSync('/file.mobile.js', 'contents');
        fs.writeFileSync('/file.mobile.ios.js', 'contents');

        //test
        let filepath = '/file.js';
        let flags = { mobile: true, ios: true };
        let resolved = resolver.resolveSync(filepath, flags);
        expect(resolved).to.equal('/file.mobile.ios.js');
      });

      it('should throw on non existing paths', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);

        //test
        let filepath = '/nope';
        let flags = {};
        expect(() => resolver.resolveSync(filepath, flags)).to.throw(/exist/);
      });

      it('should throw on non-matching paths', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.writeFileSync('/file.desktop.js', 'contents');
        fs.writeFileSync('/file.mobile.js', 'contents');

        let filepath = '/file.js';
        let flags = {};
        expect(() => resolver.resolveSync(filepath, flags)).to.throw(/match/);
      });

      it('should give priority to earlier directories', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.mkdirpSync('/foo');
        fs.mkdirpSync('/foo.android');
        fs.writeFileSync('/foo/file.android.js', 'contents');
        fs.writeFileSync('/foo.android/file.js', 'contents');

        //test
        let filepath = '/foo/file.js';
        let flags = { android: true };
        let resolved = resolver.resolveSync(filepath, flags);
        expect(resolved).to.equal('/foo.android/file.js');
      });

      it('should cache for better perf', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.mkdirpSync('/foo/bar/baz');
        fs.mkdirpSync('/foo.mobile/bar/baz');
        fs.mkdirpSync('/foo.desktop/bar/baz');
        fs.writeFileSync('/foo.desktop/bar/baz/index.js', 'contents');
        fs.writeFileSync('/foo.desktop/bar/baz/index.windows.js', 'contents');

        //test
        let filepath = '/foo/bar/baz/index.js';
        let flags = { desktop: true, windows: true };

        // no cache
        let startNoCache = process.hrtime();
        let resolvedNoCache = resolver.resolveSync(filepath, flags);
        let elapsedNoCache = process.hrtime(startNoCache);
        expect(resolvedNoCache).to.equal(
          '/foo.desktop/bar/baz/index.windows.js'
        );

        // with cache
        let startWithCache = process.hrtime();
        let resolvedWithCache = resolver.resolveSync(filepath, flags);
        let elapsedWithCache = process.hrtime(startWithCache);
        expect(resolvedWithCache).to.equal(
          '/foo.desktop/bar/baz/index.windows.js'
        );

        let noCache = elapsedNoCache[0] * 1000 + elapsedNoCache[1];
        let withCache = elapsedWithCache[0] * 1000 + elapsedWithCache[1];

        console.log(`noCache: ${(noCache/1000).toFixed(3)} ms`);
        console.log(`withCache: ${(withCache/1000).toFixed(3)} ms`);

        expect(noCache / withCache).to.be.above(1);
      });

      it('should handle multi-extension files', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.writeFileSync('/template.marko.js', 'contents');
        fs.writeFileSync('/template.ios.marko.js', 'contents');

        //test
        let filepath = '/template.marko.js';
        let flags = { ios: true };
        let resolved = resolver.resolveSync(filepath, flags);
        expect(resolved).to.equal('/template.ios.marko.js');
      });

      it('should handle names with dots', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.writeFileSync('/home.controller.js', 'contents');
        fs.writeFileSync('/home.controller.mobile.js', 'contents');

        //test
        let filepath = '/home.controller.js';
        let flags = { mobile: true };
        let resolved = resolver.resolveSync(filepath, flags);
        expect(resolved).to.equal('/home.controller.mobile.js');
      });

      it.skip('should fallback and try alternate directories', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.mkdirpSync('/test/foo');
        fs.mkdirpSync('/test.mobile/foo/');
        fs.writeFileSync('/test/foo/file.mobile.js', 'contents');

        // test
        let filepath = '/test/foo/file.js';
        let flags = { mobile: true };
        let resolved = resolver.resolveSync(filepath, flags);
        expect(resolved).to.equal('/test/foo/file.mobile.js');
      });

      it('should handle win32 paths', () => {
        // setup
        let fs = new MemoryFS();
        let resolver = new Resolver(fs);
        fs.mkdirpSync('C:\\test\\foo');
        fs.mkdirpSync('C:\\test.mobile\\foo');

        // test
        let filepath = 'C:\\test\\foo';
        let flags = { mobile: true };
        let resolved = resolver.resolveSync(filepath, flags);
        expect(resolved).to.equal('C:\\test.mobile\\foo');
      });
    });
  });

  describe('isAdaptiveSync', () => {
    describe('api errors', () => {
      let resolver = new Resolver();

      it('throw when no filepath is passed', () => {
        let filepath = null;
        expect(() => resolver.isAdaptiveSync(filepath)).to.throw(
          /filepath/i
        );
      });

      it('throw if a relative filepath is passed', () => {
        let filepath = './file.text';
        expect(() => resolver.isAdaptiveSync(filepath)).to.throw(
          /filepath/i
        );
      });
    });

    it('should check non-adaptive paths', () => {
      // setup
      let fs = new MemoryFS();
      let resolver = new Resolver(fs);
      fs.mkdirpSync('/test/foo');
      fs.mkdirpSync('/test/foo/bar');

      // test
      let filepath = '/test/foo/bar';
      let isAdaptive = resolver.isAdaptiveSync(filepath);
      expect(isAdaptive).to.equal(false);
    });

    it('should check adaptive paths', () => {
      // setup
      let fs = new MemoryFS();
      let resolver = new Resolver(fs);
      fs.mkdirpSync('/test/foo');
      fs.mkdirpSync('/test.mobile/foo');

      // test
      let filepath = '/test/foo/bar';
      let isAdaptive = resolver.isAdaptiveSync(filepath);
      expect(isAdaptive).to.equal(true);
    });

    it('should check adapted paths', () => {
      // setup
      let fs = new MemoryFS();
      let resolver = new Resolver(fs);
      fs.mkdirpSync('/test/foo/bar');
      fs.mkdirpSync('/test.mobile/foo/bar');

      // test
      let filepath = '/test.mobile/foo/bar';
      let isAdaptive = resolver.isAdaptiveSync(filepath);
      expect(isAdaptive).to.equal(false);
    });

    it('should not get confused by files', () => {
      // setup
      let fs = new MemoryFS();
      let resolver = new Resolver(fs);
      fs.mkdirpSync('/test/foo');
      fs.writeFileSync('/test.js', 'contents');
      fs.writeFileSync('/test/foo/index.js', 'contents');

      // test
      let filepath = '/test/foo/index.js';
      let isAdaptive = resolver.isAdaptiveSync(filepath);
      expect(isAdaptive).to.equal(false);
    });

    it('should handle win32 paths', () => {
      // setup
      let fs = new MemoryFS();
      let resolver = new Resolver(fs);
      fs.mkdirpSync('C:\\test\\foo');
      fs.mkdirpSync('C:\\test.mobile\\foo');

      // test
      let filepath = 'C:\\test\\foo';
      let isAdaptive = resolver.isAdaptiveSync(filepath);
      expect(isAdaptive).to.equal(true);
    });
  });

  describe('clearCache', () => {
    let resolver = new Resolver();
    it('clears the cache', () => {
      let before = resolver.matchCache;
      resolver.clearCache();
      expect(resolver.matchCache).to.not.equal(before);
    });
  });
});
