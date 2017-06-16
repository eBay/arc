var React = require('react');
var PropTypes = require('prop-types');

function getDefault(obj) { return obj && obj.__esModule ? obj.default : obj; }

module.exports = function (requireAdapted, config) {
    function AdaptiveComponent(props, context) {
        var flags = context.flags;
        var Component = getDefault(requireAdapted(flags));
        return React.createElement(Component, props);
    }

    AdaptiveComponent.contextTypes = {
        flags: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object
        ])
    };

    return AdaptiveComponent;
}