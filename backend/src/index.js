require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express();
const Queue = require("./queue/queue")
const uuid = require("uuid")
const { BullMonitorExpress } = require('@bull-monitor/express');
const basicAuth = require('express-basic-auth');
const discordAlertFailedMessageNotification = require("./notifications/discordAlertFailedMessageNotification");


app.use(express.json({ limit: '50mb' }))
app.use(cors("*"))

let todoQueue = Queue('todos')

setInterval(async () => await discordAlertFailedMessageNotification(todoQueue), 60000)

app.post("/imports-data", (request, response) => {
    const data = request.body

    if (!data.uid) {
        data.uid = uuid.v4()
    }

    todoQueue.add(data, {
        attempts: 3,
        removeOnComplete: true
    });
    response.status(200).json({
        uid: data.uid
    })
})

const monitor = new BullMonitorExpress({
    queues: [todoQueue],
    metrics: {
        collectInterval: { minutes: 5 },
        maxMetrics: 100,
    },
});

monitor.init().then(() => {
    app.use('/dashboard/queue', basicAuth({
        challenge: true,
        users: {
            [process.env.bull_monitor_username]: process.env.bull_monitor_password
        },
    }), monitor.router);

}); 

app.listen(3000, () => console.log("Server is running"))