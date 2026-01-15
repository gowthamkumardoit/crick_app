import { CallableOptions } from 'firebase-functions/v2/https';

export const MOBILE_RUNTIME: CallableOptions = {
    region: 'asia-south1',

    // 🧠 Resources
    memory: '256MiB',
    timeoutSeconds: 30,

    // 🧯 Quota protection
    maxInstances: 10,

    // 🚦 Parallel handling
    concurrency: 10,
};
