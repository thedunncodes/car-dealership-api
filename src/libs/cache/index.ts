/**
 * Cache Utility Module
 * This module initializes and exports an instance of NodeCache for in-memory caching.
 * It only lasts while the server is running. It is not persistent.
 *
 * Configuration:
 * - stdTTL: 7200 seconds (2 hours) — default time-to-live for cached items.
 * - checkperiod: 30 seconds — interval for automatic cache cleanup of expired items.
 *
 */
import NodeCache from "node-cache";

const myCache = new NodeCache({ 
  stdTTL: 7200,
  checkperiod: 30
});

export default myCache;