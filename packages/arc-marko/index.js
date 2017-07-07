var makeRenderable = require('marko/src/runtime/renderable');
var createOut = require('marko/src/runtime/createOut');

module.exports = function(requireAdapted, config) {
    var adaptiveComponent = {
		createOut,
        renderer: function(input, out) {
            var flags = out.global.flags;
			console.log('FLAGS', flags);
            var component = requireAdapted(flags);
            return component.renderer(input, out);
        },
        getDependencies: function(out) {
            var flags = out.global.flags;
            var component = requireAdapted(flags);
            return component.getDependencies(out);
        }
    };

    return makeRenderable(adaptiveComponent);
}