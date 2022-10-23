import * as client from './client.js'

client.ClientEvents.on("connect", async (token) =>  {
    console.log("Connected to PogNet")
    async () => {return new Promise((res) => {
        ClientEvents.on("PORTOPENED", () => {res(true)})
    })}
})
