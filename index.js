const path = require('path');
const express = require('express');

const app = express();
const http = require('http').createServer(app);
const zmq = require('zmq');

const reqResPort = 4000;

function makeResponder() {
  const responder = zmq.socket('router');
  responder.bindSync(`tcp://127.0.0.1:${reqResPort}`);

  responder.on('message', (...args) => {
    const identity = args[0];
    const message = args[2].toString();
    console.log(message);
    setTimeout(() => {
      responder.send([identity, '', `response: ${message}`]);
    }, 1000);
  });
}

makeResponder();

app.use('/', express.static(path.join(__dirname, 'public')));

http.listen(3010, () => {
  console.log('listening on *:3010');
});
