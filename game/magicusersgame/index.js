const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 80;
var fs = require('fs');

app.use(express.static(__dirname + '/public'));


http.listen(port, () => console.log('listening on port ' + port));