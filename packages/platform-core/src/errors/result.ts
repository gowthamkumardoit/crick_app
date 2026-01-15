import { PlatformError, Result } from "./types";

export function isErr<T>(
    r: Result<T>
): r is { ok: false; error: PlatformError } {
    return r.ok === false;
}
