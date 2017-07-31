var makeRenderable = require('marko/src/runtime/renderable');
var createOut = require('marko/src/runtime/createOut');

module.exports = function(requireArcComponent, config) {
    var arcComponent = {
		createOut,
        renderer: function(input, out) {
            var flags = out.global.flags || {};
            var component = requireArcComponent(flags);
            var renderer = component.renderer || component._;
            return renderer.call(component, input, out);
        },
        getDependencies: function(out) {
            var flags = out.global.flags || {};
            var component = requireArcComponent(flags);
            return component.getDependencies(out);
        }
    };

    return makeRenderable(arcComponent);
}