import { sha256 } from "js-sha256";
import myCache from "../../libs/cache";

/**
 * Caches a JWT token associated with a user's email.
 * The token is stored in node-cache with a key derived from the user's email.
 *
 * @param {string} token - The JWT token to be cached.
 * @param {string} email - The user's email used to create a unique cache key.
 * @returns {boolean} - Returns true if the token was successfully cached, false otherwise.
 */
export default function cacheJWT(token: string, email: string): boolean {
    const cacheKey = `jwt:${sha256(email)}`;
    const isCached = myCache.set(cacheKey, token);

    if (!isCached) {
        console.error("Failed to cache JWT token");
    }

    return isCached;
}