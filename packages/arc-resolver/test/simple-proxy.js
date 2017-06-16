// this module is called by the .arc require hook
// normally this would be a module installed from npm
// must SYNCHRONOUSLY return the proxy
module.exports = function(requireAdapted, config) {
    return requireAdapted;
}