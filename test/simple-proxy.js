// this module is called by the .adpt require hook
// normally this would be a module installed from npm
// must SYNCHRONOUSLY return the proxy
module.exports = function(requireAdapted, config) {
    return requireAdapted;
}