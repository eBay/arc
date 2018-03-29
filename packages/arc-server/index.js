let cls = require('cls-hooked');
let flagset = cls.createNamespace('arc-flagset');

exports.beginContext = (fn) => {
    flagset.run(() => {
        flagset.set('flags', {});
        fn();
    })
}

exports.setFlags = (flags) => {
    if(Array.isArray(flags)) {
        flags = flags.reduce((object, flag) => {
            if(typeof flag !== 'string') {
                throw new Error('when passing an array of flags, all flags must be strings')
            }

            object[flag] = true;

            return object;
        }, {});
    }

    if (typeof flags !== 'object') {
        throw new Error('the passed flags must be an array or object');
    }

    flagset.set('flags', Object.assign({}, flagset.get('flags'), flags));
};

exports.getFlags = () => flagset.get('flags');