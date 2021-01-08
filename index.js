const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 80;
var fs = require('fs');

app.use(express.static(__dirname + '/public'));

function onConnection(socket) {
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
    socket.on('otherMouse', (otherImage) => socket.broadcast.emit('otherMouse', otherImage));
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));