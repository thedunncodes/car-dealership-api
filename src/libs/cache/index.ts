import NodeCache from "node-cache";

// Cache TTL set to 5m, change to 1 hour
const myCache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 30
});

export default myCache;