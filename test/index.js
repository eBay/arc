require('../require-hook');

var expect = require('chai').expect;
var resolveFrom = require('../').resolveFrom;

it('should resolve adaptive files', function() {
    var flags = { mobile:true, ios:true };
    var resolvedStyle = resolveFrom(__filename, './files/style.css', { flags });
    var resolvedStyle2 = resolveFrom(resolvedStyle, './style.css', { flags });

    expect(resolvedStyle).to.equal(require.resolve('./files/style.mobile.ios.css'));
    expect(resolvedStyle2).to.equal(require.resolve('./files/style.css'));
});

it('should resolve adaptive directories', function() {
    var flags = { mobile:true, ios:true };
    var resolvedComponent = resolveFrom(__filename, './component', { flags });
    expect(resolvedComponent).to.equal(require.resolve('./component/mobile.ios/index.js'));
});

it('should handle adaptive directories via require-hook', function() {
    var component = require('./component');
    expect(component({ mobile:true })).to.equal('component/mobile');
});

it('should handle defaults for adaptive directories', function() {
    var component = require('./component');
    expect(component({ })).to.equal('component/default');
});

it('should allow the default for adaptive directories to be configured', function() {
    var component = require('./component-custom-default');
    expect(component({})).to.equal('component/desktop');
});