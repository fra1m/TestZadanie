const express = require('express');
const redis = require('redis');

const app = express();
const port = 3000;

const REDIS_PORT = process.env.REDIS_HOST || 'localhost';
const REDIS_HOST = process.env.REDIS_PORT || 6379;

const client = redis.createClient({
    url: `redis://${REDIS_PORT}:${REDIS_HOST}`,
});

app.get('/api/time', async (req, res) => {
    const cachedTime = await getCachedTime();
    res.send(cachedTime);
});

async function getCachedTime() {
    const time = await client.get('cachedTime');
    if (!time) {
        return updateAndCacheTime()
    }
    return time
}

async function updateAndCacheTime() {
    const currentTime = new Date().toLocaleTimeString();
    await client.set('cachedTime', currentTime, { EX: 10 });
    return currentTime;
}

app.listen(port, async () =>  {
    try {
        await client
            .on('error', err => console.log('Redis Client Error', err))
            .connect();
    } catch (err) {
        console.log(`Redis ERR: ${err}`)
    }
  
    console.log(`Backend listening at http://localhost:${port}`);
});
