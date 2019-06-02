const path = require('path');
const express = require('express');
const ports = require('@social/social-deployment/topology/portMaps');

const app = express();
const http = require('http').createServer(app);
const zmq = require('zmq');

const publisher = zmq.socket('push');
publisher.bindSync(`tcp://127.0.0.1:${ports.images.pubsub}`);

const subscriber = zmq.socket('sub');
subscriber.connect(`tcp://127.0.0.1:${ports.pubsub}`);
subscriber.subscribe('kitty.kat');
subscriber.subscribe('doggy.dog');
subscriber.on('message', (topic, message) => {
    console.log('received a message related to:', topic.toString(), 'containing message:', message.toString());
});

function publish(topic, data) {
    try {
        const m = JSON.stringify([topic, data]);
        publisher.send(m);
    } catch (err) {
        console.log(err);
    }
}

function makeResponder() {
    const responder = zmq.socket('router');
    responder.bindSync(`tcp://127.0.0.1:${ports.images.crud}`);

    responder.on('message', (...args) => {
        const identity = args[0];
        // const message = args[2].toString();
        const response = JSON.stringify({
            status: 200,
            payload: 'I did something in the images microservice'
        });
        setTimeout(() => {
            publish('kitty.kat', 'Publish something in the images microservice');
            publish('doggy.dog', 'Publish something in the images microservice2');
            responder.send([identity, '', response]);
        }, 100);
    });
}

makeResponder();

app.use('/', express.static(path.join(__dirname, 'public')));

http.listen(3010, () => {
    console.log('listening on *:3010');
});
