var path = require('path');
var arcResolver = require('arc-resolver');

module.exports = function(lasso, config) {
    lasso.dependencies.registerRequireType('arc', {
        read: function(){}
    });
}