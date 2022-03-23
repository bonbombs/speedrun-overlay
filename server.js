const express = require('express')
const app = express()
const expressWs = require('express-ws')(app)
const OverlayData = require('./server/OverlayData')
const port = 3000

const overlayData = new OverlayData(['bon', 'tom'], ['partA', 'partB', 'partC']);

app.ws('/socket', function(ws, req) {
    ws.on('message', function(msg) {
        ws.send(msg);
    });
});

app.get('/start', (req, res) => {
    console.log(req.params)
    overlayData.update(req.params.user, req.params.part);
    res.json(overlayData);
});

app.get('/update/:user', (req, res) => {
    console.log(req.params)
    overlayData.stopForUser(req.params.user);
    console.log(JSON.stringify(overlayData));
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});