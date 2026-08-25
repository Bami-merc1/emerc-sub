import Queue from "bull";
import { redisConnection } from "../utils/redis";

export const airtimeExpiryQueue = new Queue("airtime-sell-expiry", redisConnection);
export const airtimePollingQueue = new Queue("airtime-sell-polling", redisConnection);