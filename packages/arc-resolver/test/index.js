require('../require-hook');

var expect = require('chai').expect;
var resolveFrom = require('../').resolveFrom;

it('should resolve adaptive files', function() {
    var flags = ['mobile', 'ios'];
    var resolvedStyle = resolveFrom(__filename, './files/style.css', { flags });

    expect(resolvedStyle).to.equal(require.resolve('./files/style.mobile.ios.css'));
});

it('should not adapt files within the same group', function() {
    var flags = ['mobile', 'ios'];
    var defaultStyle = require.resolve('./files/style.css');
    var mobileStyle = require.resolve('./files/style.mobile.css');
    var iosStyle = require.resolve('./files/style.mobile.ios.css');

    var resolvedStyle = resolveFrom(mobileStyle, './style.css', { flags });
    var resolvedStyle2 = resolveFrom(iosStyle, './style.css', { flags });

    expect(resolvedStyle).to.equal(defaultStyle);
    expect(resolvedStyle2).to.equal(defaultStyle);
});

it('should resolve adaptive directories', function() {
    var flags = ['mobile', 'ios'];
    var resolvedComponent = resolveFrom(__filename, './component', { flags });
    expect(resolvedComponent).to.equal(require.resolve('./component/mobile.ios/index.js'));
});

it('should handle adaptive directories via require-hook', function() {
    var component = require('./component');
    expect(component(['mobile'])).to.equal('component/mobile');
});

it('should handle defaults for adaptive directories', function() {
    var component = require('./component');
    expect(component({})).to.equal('component/default');
});

it('should allow the default for adaptive directories to be configured', function() {
    var component = require('./component-custom-default');
    expect(component({})).to.equal('component/desktop');
});

it('should throw if there is no default for adaptive directories', function() {
    expect(function() {
        var component = require('./component-no-default');
        component(['mobile']);
    }).to.throw();
});