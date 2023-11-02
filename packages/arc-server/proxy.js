let arc = require("./index");
let { hasOwnProperty } = Object.prototype;
let fnToString = Function.prototype.toString;
let kToPrimitive = Symbol.toPrimitive;

module.exports = function AdaptiveProxy(matches) {
  return createAdaptiveProxy(matches, [], matches.default);
};

function createAdaptiveProxy(matches, path, defaultTarget) {
  if (defaultTarget == null) return defaultTarget;

  let proxyCache = {};
  let resolveTarget = (target, flags) => {
    return flags ? Object(getPath(matches.match(flags), path)) : target;
  };

  return new Proxy(
    typeof defaultTarget === "object"
      ? toConfigurable(defaultTarget)
      : Object(defaultTarget),
    {
      apply(target, thisArg, argumentsList) {
        return Reflect.apply(
          resolveTarget(target, arc.getFlags()),
          thisArg,
          argumentsList
        );
      },
      construct(target, argumentsList, newTarget) {
        return Reflect.construct(
          resolveTarget(target, arc.getFlags()),
          argumentsList,
          newTarget
        );
      },
      defineProperty(target, property, descriptor) {
        return Reflect.defineProperty(
          resolveTarget(target, arc.getFlags()),
          property,
          descriptor
        );
      },
      deleteProperty(target, property) {
        return Reflect.deleteProperty(
          resolveTarget(target, arc.getFlags()),
          property
        );
      },
      get(target, property) {
        let flags = arc.getFlags();
        let resolvedTarget = flags
          ? getPath(matches.match(flags), path)
          : defaultTarget;

        if (property === kToPrimitive) {
          // Symbol.toPrimitive must return the actual primitive value, so our proxy must stop.
          return () => resolvedTarget;
        }

        let value = Reflect.get(
          flags ? Object(resolvedTarget) : target,
          property,
          resolvedTarget
        );

        if (
          typeof value === "function" &&
          !hasOwnProperty.call(resolvedTarget, property) &&
          isNativeCode(value)
        ) {
          // bind functions to the target so that built in types work properly
          return value.bind(resolvedTarget);
        }

        if (flags) {
          return value;
        }

        return (
          proxyCache[property] ||
          (proxyCache[property] = createAdaptiveProxy(
            matches,
            [...path, property],
            value
          ))
        );
      },
      getOwnPropertyDescriptor(target, property) {
        const descriptor = Reflect.getOwnPropertyDescriptor(
          resolveTarget(target, arc.getFlags()),
          property
        );

        if (descriptor) {
          if (descriptor.configurable === false) {
            descriptor.configurable = true;
          }
        }

        return descriptor;
      },
      getPrototypeOf(target) {
        return Reflect.getPrototypeOf(resolveTarget(target, arc.getFlags()));
      },
      has(target, property) {
        return Reflect.has(resolveTarget(target, arc.getFlags()), property);
      },
      isExtensible(target) {
        return Reflect.isExtensible(resolveTarget(target, arc.getFlags()));
      },
      ownKeys(target) {
        return Reflect.ownKeys(resolveTarget(target, arc.getFlags()));
      },
      preventExtensions(target) {
        return Reflect.preventExtensions(resolveTarget(target, arc.getFlags()));
      },
      set(target, property, value) {
        let resolvedTarget = resolveTarget(target, arc.getFlags());
        return Reflect.set(resolvedTarget, property, value, resolvedTarget);
      },
      setPrototypeOf(target, proto) {
        return Reflect.setPrototypeOf(
          resolveTarget(target, arc.getFlags()),
          proto
        );
      },
    }
  );
}

function isNativeCode(fn) {
  return fnToString.call(fn).includes("[native code]");
}

function getPath(object, path) {
  let result = object;
  for (key of path) {
    result = result[key];
  }
  return result;
}

function toConfigurable(obj) {
  const props = Object.getOwnPropertyDescriptors(obj);
  let isConfigurable = Object.isExtensible(obj);
  for (const key in props) {
    const prop = props[key];
    if (prop.configurable === false) {
      prop.configurable = true;
      isConfigurable = false;
    }
  }

  return isConfigurable ? obj : Object.create(obj.__proto__ || null, props);
}
