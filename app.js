const express = require('express')
const app = express()
const expressWs = require('express-ws')(app)
const path = require('path')
const fs = require('fs')
const OverlayData = require('./OverlayData')
const port = 3000

let latestData;

app.use(express.json())

app.ws('/socket', function(ws, req) {
    ws.on('message', function(msg) {
        ws.send(msg);
    });
});

app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', "index.html"));
})

app.get('/latest', (req, res) => {
    res.json(getLatestFile());
});

app.post('/start', (req, res) => {
    latestData.startTimer();
    expressWs.getWss().clients.forEach((ws)=> {
        ws.send(JSON.stringify({
            type: "START_TIMER",
            data: latestData
        }));
    })
    res.json(latestData);
});

app.post('/create/:user', (req, res) => {
    res.json(latestData);
})

app.post('/update/:user/:part', (req, res) => {
    console.log(req.params)
    latestData.update(req.params.user, req.params.part);
    res.json(latestData);
});

app.post('/reset', (req, res) => {
    // console.log(req.body)
    getLatestFile().reset(req.body.users, req.body.parts);
    expressWs.getWss().clients.forEach((ws)=> {
        ws.send(JSON.stringify({
            type: "RESET_TIMER",
            data: latestData
        }));
    })
    res.json(latestData);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function getLatestFile (path) {
    if (latestData) return latestData;
    if (fs.existsSync(path)) {
        latestData = fs.readFileSync(path, "utf8");
    }
    else {
        latestData = new OverlayData();
    }

    return latestData;
}