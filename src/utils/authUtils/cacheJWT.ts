import { sha256 } from "js-sha256";
import myCache from "../../libs/cache";

export default function cacheJWT(token: string, email: string): boolean {
    const cacheKey = `jwt:${sha256(email)}`;
    const isCached = myCache.set(cacheKey, token);

    if (!isCached) {
        console.error("Failed to cache JWT token");
    }

    return isCached;
}