var React = require('react');

module.exports = function(requireAdapted, config) {
    function AdaptiveComponent(props, context) {
        var flags = context.flags;
        var Component = requireAdapted(flags);
        return React.createElement(Component, props);
    }

    AdaptiveComponent.contextTypes = {
        flags: React.PropTypes.oneOfType([
            React.PropTypes.array,
            React.PropTypes.object
        ])
    };

    return AdaptiveComponent;
}