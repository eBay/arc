require('../install');

let expect = require('chai').expect;
let arc = require('../index');
let AdaptiveProxy = require('../proxy');

describe('Context API', () => {
  describe('getFlags', () => {
    it('should return undefined before any context', () => {
      // this test must run first
      expect(arc.getFlags()).to.equal(undefined);
    });
    it('should return empty object if no flags are set', () => {
      arc.setFlagsForContext([], () => {
        expect(arc.getFlags()).to.eql({});
      });
    });
    it('should return undefined outside a context', () => {
      expect(arc.getFlags()).to.equal(undefined);
    });
    it('should get flags across async boundary', (done) => {
      const callback = () => {
        callback.flags = arc.getFlags();
      }

      arc.setFlagsForContext(['test'], () => {
        setTimeout(callback, 25);
      });

      // done is called outside the context/callback
      // so that subsequent tests are not part of the
      // context created for this test
      setTimeout(() => {
        expect(callback.flags).to.eql({ test:true });
        done();
      }, 50)
    });
    it('should allow nesting flag contexts', () => {
      arc.setFlagsForContext(['foo'], () => {
        expect(arc.getFlags()).to.eql({ foo:true });
        arc.setFlagsForContext(['bar'], () => {
          expect(arc.getFlags()).to.eql({ bar:true });
        });
        expect(arc.getFlags()).to.eql({ foo:true });
      });
    });
    it('should reset context even when error is thrown', () => {
      expect(arc.getFlags()).to.eql(undefined);
      expect(() => {
        arc.setFlagsForContext(['foo'], () => {
          expect(arc.getFlags()).to.eql({ foo:true });
          throw new Error('TEST ERROR');
        });
      }).to.throw(/TEST ERROR/);
      expect(arc.getFlags()).to.eql(undefined);
    });
  });
  describe('setFlagsForContext', () => {
    it('should set a flag object', () => {
      arc.setFlagsForContext({ flag: true }, () => {
        expect(arc.getFlags()).to.eql({ flag: true });
      });
    });
    it('should convert an array to an object', () => {
      arc.setFlagsForContext(['flag'], () => {
        expect(arc.getFlags()).to.eql({ flag: true });
      });
    });
    it("should throw if you don't pass an array or object", () => {
      expect(() => 
        arc.setFlagsForContext('flag', () => {})
      ).to.throw(/flags/);
    });
    it('should throw if pass an array of non-strings', () => {
        expect(() =>
          arc.setFlagsForContext([1, 2, 3], () => {})
        ).to.throw(/flags/);
    });
    it('should throw if pass only function', () => {
        expect(() =>
          arc.setFlagsForContext(() => {})
        ).to.throw(/flags/);
    });
    it('should throw if pass only flags', () => {
        expect(() =>
          arc.setFlagsForContext([1, 2, 3])
        ).to.throw();
    });
  });
  describe('useCustomFlagGetter', () => {
    it('should allow using a custom getter', () => {
      try {
        arc.useCustomFlagGetter(() => ['flag']);
        expect(arc.getFlags()).to.eql({ flag:true });
      } finally {
        // this is global, so we need to reset it
        // to not affect other tests
        arc.useCustomFlagGetter(false);
      }
    });
  });
});

describe('AdaptiveRequireHook', () => {
  describe('install', () => {
    it('should allow node native modules to pass through', () => {
      require('http');
    });

    it('should allow node native modules with node: prefix to pass through', () => {
      require('node:events');
    });

    it('should throw a missing module error when a module does not exist', () => {
      expect(() => require('./missing')).to.throw("Cannot find module './missing'");
    })
  });

  describe('directories', () => {
    it('should resolve adaptive files', function() {
      arc.setFlagsForContext(['desktop'], () => {
        let proxy = require('./directories');
        expect(proxy.test()).to.equal('component/desktop');
      });
    });

    it('should resolve adaptive files', function() {
      arc.setFlagsForContext(['mobile', 'ios'], () => {
        let proxy = require('./directories');
        expect(proxy.test()).to.equal('component/mobile.ios');
      });
    });
  });

  describe('invisible directories', () => {
    it('should resolve adaptive files', function() {
      arc.setFlagsForContext(['desktop'], () => {
        let proxy = require('./invisible-directories');
        expect(proxy.test()).to.equal('component/desktop');
      });
    });

    it('should resolve adaptive files', function() {
      arc.setFlagsForContext(['mobile', 'ios'], () => {
        let proxy = require('./invisible-directories');
        expect(proxy.test()).to.equal('component/mobile.ios');
      });
    });
  });

  describe('primitives', () => {
    it('should resolve adaptive files', function() {
      let primitive = require('./primitives');
      arc.setFlagsForContext([], () => {
        expect(primitive.valueOf()).to.equal('hello');
      });
    });

    it('should resolve adaptive files', function() {
      let primitive = require('./primitives');
      arc.setFlagsForContext([], () => {
        expect(primitive + '').to.equal('hello');
      });
    });

    it('should resolve adaptive files', function() {
      let primitive = require('./primitives');
      arc.setFlagsForContext(['number'], () => {
        expect(primitive.valueOf()).to.equal(42);
      });
    });

    it('should resolve adaptive files', function() {
      let primitive = require('./primitives');
      arc.setFlagsForContext(['number'], () => {
        expect(primitive + 0).to.equal(42);
      });
    });

    it('should allow inspecting - and therefore logging', function() {
      let util = require('util');
      let adaptiveValue = require('./primitives');
      arc.setFlagsForContext([], () => {
        expect(util.inspect(adaptiveValue)).to.include("'hello'");
      });
    });

    it('should instanceof', function() {
      let util = require('util');
      let adaptiveValue = require('./primitives');
      arc.setFlagsForContext([], () => {
        expect(adaptiveValue instanceof String).to.equal(true);
      });
      arc.setFlagsForContext(['number'], () => {
        expect(adaptiveValue instanceof Number).to.equal(true);
      });
      arc.setFlagsForContext(['boolean'], () => {
        expect(adaptiveValue instanceof Boolean).to.equal(true);
      });
    });
  });

  describe('objects', () => {
    it('should return non-configurable property descriptors as configurable', function() {
      let adaptiveValue = require('./objects');
      arc.setFlagsForContext(['config'], () => {
        let foo = Object.getOwnPropertyDescriptor(adaptiveValue, 'foo');
        let bar = Object.getOwnPropertyDescriptor(adaptiveValue, 'bar');
        let missing = Object.getOwnPropertyDescriptor(adaptiveValue, 'missing');
        expect(foo).to.eql({
          value: 1,
          writable: false,
          enumerable: false,
          configurable: true
        });
        expect(bar).to.eql({
          value: 2,
          writable: false,
          enumerable: false,
          configurable: true
        });
        expect(missing).to.equal(undefined);
      });
    });
    it('should allow inspecting - and therefore logging', function() {
      let util = require('util');
      let adaptiveValue = require('./objects');
      arc.setFlagsForContext([], () => {
        expect(util.inspect(adaptiveValue)).to.equal(
          "{ a: 1, b: 2, c: { hello: 'world', foo: 'bar' } }"
        );
      });
    });
  });

  describe('functions', () => {
    it('should resolve adaptive functions', function() {
      let fn = require('./functions');
      arc.setFlagsForContext([], () => {
        expect(fn()).to.equal(123);
      });
    });

    it('should resolve adaptive functions', function() {
      let fn = require('./functions');
      arc.setFlagsForContext(['456'], () => {
        expect(fn()).to.equal(456);
      });
    });
  });
});

describe('AdaptiveProxy', () => {
  
  it('should work outside an arc context', () => {
    let proxy = new AdaptiveProxy({ 
      get default() {
        return { a: { b: { c() { return 123; } } } }
      }
    });
    expect(proxy.a.b.c()).to.equal(123);
  });

  it('should work outside an arc context (primitives)', () => {
    let proxy = new AdaptiveProxy({ 
      get default() {
        return { a: { b: { c: 123 } } }
      }
    });
    
    expect(+proxy.a.b.c).to.equal(123);
    expect(proxy.a.b.c).to.not.equal(123);
    expect(proxy.a.b.c == 123).to.equal(true);
    expect(proxy.a.b.c === 123).to.equal(false);
  });

  it('should work with a class instance outside an arc context (primitives)', () => {
    class Test {
      constructor(val) {
        this.val = val;
      }
      get() {
        return this.val;
      }
    }

    let defaultValue = new Test(123);
    let proxy = new AdaptiveProxy({ 
      get default() {
        return defaultValue;
      }
    });

    expect(+proxy.get()).to.equal(123);
    expect(proxy.get()).to.not.equal(123);
    expect(proxy.get() == 123).to.equal(true);
    expect(proxy.get() === 123).to.equal(false);
  });

  it('should return null/undefined if a property that doesn\'t exist on the default target is accessed outside an arc context', () => {
    let proxy = new AdaptiveProxy({ 
      get default() {
        return { a: 123 }
      }
    });
    expect(proxy.d).to.equal(undefined);
  });

  it('should proxy multiple levels outside an arc context', () => {
    let proxy = new AdaptiveProxy({ 
      get default() {
        return { a: { b: { c() { return 123; } } } };
      },
      match() {
        return { a: { b: { c() { return 456; } } } };
      }
    });
    let c = proxy.a.b.c;
    arc.setFlagsForContext(['*'], () => {
      expect(c()).to.equal(456);
    });
  });

  it('should proxy multiple levels outside an arc context (primitives)', () => {
    let proxy = new AdaptiveProxy({ 
      get default() {
        return { a: { b: { c: 'abc' } } };
      },
      match() {
        return { a: { b: { c: 'def' } } };
      }
    });
    let c = proxy.a.b.c;
    arc.setFlagsForContext(['*'], () => {
      expect(''+c).to.equal('def');
      expect(c).to.not.equal('def');
      expect(c == 'def').to.equal(true);
      expect(c === 'def').to.equal(false);
    });
  });

  it('should resolve immediately when in an arc context', () => {
    let defaultValue = { a:true };
    let matchedValue = { a:false };
    let proxy = new AdaptiveProxy({ 
      get default() {
        return defaultValue;
      },
      match() {
        return matchedValue;
      }
    });

    expect(proxy.a).to.not.equal(defaultValue.a);
    expect(proxy.a).to.not.equal(matchedValue.a);
    arc.setFlagsForContext(['*'], () => {
      expect(proxy.a).to.not.equal(defaultValue.a);
      expect(proxy.a).to.equal(matchedValue.a);
    });
  });
})
