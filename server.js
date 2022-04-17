const express = require('express')
const app = express();
const expressWs = require('express-ws')(app)
const path = require('path')
const http = require('http');
const OverlayData = require('./server/OverlayData')
const port = 3000

const overlayData = new OverlayData(['bon', 'tom'], ['partA', 'partB', 'partC']);

app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', "index.html"));
})

app.post('/setup', (req, res) => {
    overlayData = new OverlayData(req.body.users, req.body.parts);
    updateAllUsers('UPDATE_STATUS');
    res.sendStatus(200);
});

app.get('/start', (req, res) => {
    console.log(req.params)
    overlayData.start();
    updateAllUsers('START_TIMER');
    res.json(overlayData);
});

app.post('/reset', (req, res) => {
    console.log(req.params)
    overlayData.reset();
    updateAllUsers('RESET_TIMER');
    res.json(overlayData);
});

app.get('/update/:user', (req, res) => {
    console.log(req.params)
    overlayData.stopForUser(req.params.user);
    console.log(JSON.stringify(overlayData));
    updateAllUsers('UPDATE_STATUS');
    res.sendStatus(200);
});

app.ws('/socket', function(ws, req) {
    ws.on('message', function(msg) {
        ws.send(msg);
    });
    ws.on('open', function(){
        console.log('open!');
    })
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});


function updateAllUsers(type){
    expressWs.getWss().clients.forEach((ws)=> {
        ws.send(JSON.stringify({
            type: type,
            data: overlayData
        }));
    })
}