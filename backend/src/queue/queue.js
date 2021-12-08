const Queue = require("bull")
const queueByName = {}

module.exports = (name) => {
    if (queueByName[name]) {
        return queueByName[name];
    }
    queueByName[name] = new Queue(name, process.env.redis_url);
    return queueByName[name];
}