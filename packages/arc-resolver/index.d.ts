export default class Resolver {
  constructor(fs?: {
    stat: unknown,
    statSync: unknown,
    readdir: unknown,
    readdirSync: unknown,
  });

  clearCache(): void;
  getMatchesSync(filepath: string): MatchSet;
  resolveSync(filepath: string): string;
  isAdaptiveSync(filepath: string): boolean;
}

export class MatchSet<T = string> {
  constructor(raw: ({ flags: string[], value: T })[]);
  raw: ({ flags: string[], value: T })[];
  default: T;
  count: number;
  match(flags: Record<string, boolean>): T;
  [Symbol.iterator](): Iterator<T>;
}
