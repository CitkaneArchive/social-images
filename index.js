'use strict';

const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
var zmq = require('zmq');

const sock = zmq.socket('pull');
 
sock.connect('tcp://192.168.0.104:4000');
console.log('Worker connected to port 4000');
 
sock.on('message', function(msg){
  console.log('work: %s', msg.toString());
});

app.use("/", express.static(path.join(__dirname, 'public')));

http.listen(3010, function(){
  console.log('listening on *:3010');
});