const { Server } = require("socket.io")
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const io = new Server({ /* options */ })

function CreateData(port,sender,data){
    return {port,sender,data}
}

let OpenPorts = {}
let Sockets = {}
const data = fs.readFileSync('./IPS.json', 'utf8')
const IPs = JSON.parse(data)
for (var i in IPs){
    OpenPorts[i] = {}
}
io.on("connection", socket => {
    let label = "Auth Time"
    let label2 = "Connection time"
    console.time(label)
    const data = fs.readFileSync('./IPS.json', 'utf8')
    let IPBuff = ""
    let NextData = ""
    let SafeExit = false
    let DataFrom = ""
    let NextPort = 0
    let AuthenticationToken = uuidv4()
    let MessageQueue = []
    socket.send("CONNECTIONPACKET")
    socket.on("message", (message) => {
        const IPs = JSON.parse(data)
        if (message.startsWith("IP")){
            let x = message.split(" ")[1]
            IPBuff = x
            socket.send("PASSWORDPACKET")
        }
        if (message.startsWith("PASS")){
            let x = message.split(" ")[1]
            if (IPs[IPBuff] == x){
                if (IPBuff in Sockets){
                    socket.send("EXISTSFAILURE")
                    SafeExit = true;
                }
                else{
                    console.timeEnd(label)
                    console.time(label2)
                    socket.send("AUTH " + AuthenticationToken)
                    Sockets[IPBuff] = socket;
                }
            }
            else{
                socket.send("FAILURE")
            }
        }
        if (message.startsWith("DATACALLBACK")){
            let x = message.split(" ")[1]
            if (AuthenticationToken == x){
                let y = MessageQueue.pop()
                socket.send("DATA "+ y[0] + " " + y[1] + " " + y[2])
                if (MessageQueue.length > 0){
                    socket.send("NEWDATA")
                }
            }
            else{
                socket.send("FAILURE")
            }
        }
        if (message.startsWith("OPENPORT")){
            let x = message.split(" ")[1]
            NextPort = x
            socket.send("PORTAUTH")
        }
        if (message.startsWith("PORTAUTH")){
            let x = message.split(" ")[1]
            if (AuthenticationToken == x){
                console.log(`${NextPort}`)
                socket.send("OPEN")
            }
            else{
                socket.send("FAILURE")
            }
        }
        }
    )
    socket.on("disconnect", () => {
        try{
            if (!SafeExit){
                delete Sockets[IPBuff]
                OpenPorts[IPBuff] = {}
                console.timeEnd(label2)
            }
        }
        catch{}
    })
})
io.listen(3000)