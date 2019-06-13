/* eslint-disable import/order */
/* eslint-disable prefer-promise-reject-errors */
const config = require('config');

// eslint-disable-next-line no-underscore-dangle
global.__network = config.get('network');

const path = require('path');
const express = require('express');
const ports = require('@social/social-deployment/topology/portMaps');
const Sockets = require('../social-deployment/templates/nodejs/api/Sockets');
const Api = require('./src/api/Api');

const app = express();
const http = require('http').createServer(app);

const sockets = new Sockets('images');

sockets.subscribe('users.refreshCache');
sockets.subscriber.on('message', (topic, message) => {
    console.log('received a message related to:', topic.toString(), 'containing message:', message.toString());
});
setTimeout(() => {
    sockets.publish('users.newUser', 'testing pubsub');
}, 5000);

const api = new Api(sockets);
const apiInterface = {
    create: {},
    read: {
        test: (ownerId, args) => api.test(...args)
            .then(payload => ({ status: 201, payload }))
            .catch(err => Promise.reject({ status: err.status || 500, message: err.message }))
    },
    update: {},
    delete: {}
};

sockets.makeResponder(apiInterface);

app.use('/', express.static(path.join(__dirname, 'public')));

http.listen(ports.images.static, __network.host);

/*
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

http.listen(ports.images.static);

*/
