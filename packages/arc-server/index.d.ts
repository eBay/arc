export function withFlags<T>(flags: Record<string, boolean>, fn: () => T): T;
export function getFlags(): Record<string, boolean> | undefined;
