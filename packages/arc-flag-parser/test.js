let expect = require('chai').expect;
let { SyntaxError, parse } = require('./index');

describe('Flag Parser', () => {
  describe('success', () => {
    it('should work', () => {
      expect(parse('mobile')).to.eql([['mobile']]);
    });
    it('should work', () => {
      expect(parse('mobile+ios')).to.eql([['mobile', 'ios']]);
    });
    it('should work', () => {
      expect(parse('mobile,ios')).to.eql([['mobile'], ['ios']]);
    });
    it('should work', () => {
      expect(parse('mobile,ios+[safari,chrome]')).to.eql([
        ['mobile'],
        ['ios', 'safari'],
        ['ios', 'chrome']
      ]);
    });
    it('should work', () => {
      expect(parse('ios+[safari,chrome]+mobile')).to.eql([
        ['ios', 'safari', 'mobile'],
        ['ios', 'chrome', 'mobile']
      ]);
    });
    it('should work', () => {
      expect(parse('ios+[safari,chrome]+mobile+[x,y]')).to.eql([
        ['ios', 'safari', 'mobile', 'x'],
        ['ios', 'chrome', 'mobile', 'x'],
        ['ios', 'safari', 'mobile', 'y'],
        ['ios', 'chrome', 'mobile', 'y']
      ]);
    });
    it('should work', () => {
      expect(parse('ios+[safari+chrome]')).to.eql([
        ['ios', 'safari', 'chrome']
      ]);
    });
    it('should work', () => {
      expect(parse('mobile+[ios+safari,chrome]')).to.eql([
        ['mobile', 'ios', 'safari'],
        ['mobile', 'chrome']
      ]);
    });
    it('should work', () => {
      expect(parse('under_score+dash-ed')).to.eql([
        ['under_score', 'dash-ed']
      ]);
    });
    it('should allow explicit startRule', () => {
      expect(parse('mobile', { startRule:'Start' })).to.eql([['mobile']]);
    });
  });
  describe('syntax errors', () => {
    it('should fail', () => {
      expect(() => parse('mobile+')).to.throw(SyntaxError);
    });
    it('should fail', () => {
      expect(() => parse('')).to.throw(SyntaxError);
    });
    it('should fail', () => {
      expect(() => parse('mobile,')).to.throw(SyntaxError);
    });
    it('should fail', () => {
      expect(() => parse('mobile[')).to.throw(SyntaxError);
    });
    it('should fail', () => {
      expect(() => parse('mobile+[')).to.throw(SyntaxError);
    });
    it('should fail', () => {
      expect(() => parse('mobile+[ios,')).to.throw(SyntaxError);
    });
    it('should fail', () => {
      expect(() => parse('\n')).to.throw(SyntaxError);
    });
    it('should fail', () => {
      expect(() => parse('[ios,foo,]')).to.throw(SyntaxError);
    });
    it('should fail', () => {
      expect(() => parse('[ios,foo,a!]')).to.throw(SyntaxError);
    });
    it('should fail', () => {
      expect(() => parse('@')).to.throw(SyntaxError);
    });
    it('should fail', () => {
      expect(() => parse('mobile', { startRule:'undefined' })).to.throw(Error);
    });
    it('should fail', () => {
      expect(() => parse('\x0F')).to.throw(SyntaxError, '\\x0F');
    });
    it('should fail', () => {
      expect(() => parse('\x9F')).to.throw(SyntaxError, '\\x9F');
    });
  });
});
