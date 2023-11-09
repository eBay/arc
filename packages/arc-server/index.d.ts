export function withFlags<T>(flags: Record<string, boolean>, fn: () => T): T;
export function setFlags(flags: Record<string, boolean>): void;
export function getFlags(): Record<string, boolean> | undefined;
