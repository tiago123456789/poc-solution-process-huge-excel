const Queue = require("../queue/queue")
const todoQueue = Queue('todos');
const Pusher = require("pusher");
const axios = require("axios")

const pusher = new Pusher({
  appId: process.env.pusher_appId,
  key: process.env.pusher_key,
  secret: process.env.pusher_secret,
  cluster: process.env.pusher_cluster,
  useTLS: process.env.pusher_useTLS,
});
 
console.log("#### Init consumer process excel #####")
todoQueue.process(function (job, done) {
    if (job.data.triggerFail) {
        throw new Error("Trigger job failed")
    }
    const { stepImportationExcel, totalSteps } = job.data;

    let percenteImportationExcel = parseInt((100 / totalSteps) * stepImportationExcel)
    if (totalSteps == stepImportationExcel) {
        percenteImportationExcel = 100
    }
    console.log("Percente => ", percenteImportationExcel)
    pusher.trigger("my-channel", "my-event", {
        message: {
            percenteImportationExcel
        }
    });
    done()
});
