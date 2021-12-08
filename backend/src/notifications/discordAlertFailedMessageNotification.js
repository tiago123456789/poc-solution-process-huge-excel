module.exports = async (todoQueue) => {
    try {
        const qtdFailed = await todoQueue.getFailedCount()
        let message = `**Hey! You have ${qtdFailed} failed message \n`
        message += `Link check failed message**: http://localhost:3000/dashboard/queue?share=ewogICJwYWdlIjogMCwKICAicXVldWUiOiAiWW5Wc2JIUnZaRzl6IiwKICAicXVldWVMYWJlbCI6ICJ0b2RvcyIsCiAgInN0YXR1cyI6ICJmYWlsZWQiLAogICJvcmRlciI6ICJERVNDIiwKICAiam9iSWQiOiAiIiwKICAiZGF0YVNlYXJjaCI6ICIiCn0%3D \n`
        message += "@here"
        await axios.post(process.env.discord_webhook, {
            content: message
        })
    } catch(error) {
        console.log(error);
    }
}