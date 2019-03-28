let { createHook, executionAsyncId } = require('async_hooks');
let contexts = new Map();
let customFlagGetter;
let hook;

exports.useCustomFlagGetter = (fn) => {
    customFlagGetter = fn;
};

exports.setFlagsForContext = (flags, fn) => {
    if (!hook) {
        hook = createHook({ 
            init(asyncId, type, triggerAsyncId) {
                const context = contexts.get(triggerAsyncId);
                if (context) {
                    contexts.set(asyncId, context);
                }
            },
            destroy(asyncId) {
                contexts.delete(asyncId);
            }
        })
        hook.enable();
    }

    const id = executionAsyncId();
    const oldValue = contexts.get(id);
    contexts.set(id, normalizeFlags(flags));
    try {
        fn();
    } finally {
        if (oldValue === undefined) {
            contexts.delete(id);
        } else {
            contexts.set(id, oldValue);
        }
    }
};

exports.getFlags = () => customFlagGetter ? normalizeFlags(customFlagGetter()) : contexts.get(executionAsyncId());

function normalizeFlags(flags) {
    if (Array.isArray(flags)) {
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