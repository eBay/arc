declare function createAdaptiveProxy<T>(matches: {
  default: T,
  match(flags: Record<string, boolean>): T
}): T;

export = createAdaptiveProxy;
