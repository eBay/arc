var makeRenderable = require('marko/runtime/renderable');

module.exports = function(requireAdapted, config) {
    var adaptiveComponent = {
        renderer: function(input, out) {
            var flags = out.global.flags;
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