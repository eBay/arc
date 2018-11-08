let cls = require('cls-hooked');
let customFlagGetter;
let flagset;

exports.useCustomFlagContext = (fn) => {
    customFlagGetter = fn;
};

exports.beginContext = (fn) => {
    flagset = flagset || cls.createNamespace('arc-flagset');
    flagset.run(() => {
        flagset.set('flags', {});
        fn();
    });
};

exports.setFlags = (flags) => {
    flagset.set('flags', Object.assign({}, flagset.get('flags'), normalizeFlags(flags)));
};

exports.getFlags = () => customFlagGetter ? normalizeFlags(customFlagGetter()) : flagset && flagset.get('flags');

function normalizeFlags(flags) {
    if(Array.isArray(flags)) {
        return flags.reduce((object, flag) => {
            if (typeof flag !== 'string') {
                throw new Error('when passing an array of flags, all flags must be strings')
            }

            object[flag] = true;

            return object;
        }, {});
    }

    if (typeof flags !== 'object') {
        throw new Error('the passed flags must be an array or object');
    }

    return flags;
}