/* eslint-disable import/order */
/* eslint-disable prefer-promise-reject-errors */
const config = require('config');
const path = require('path');
const express = require('express');
const Sockets = require('../../social-deployment/templates/nodejs/api/Sockets');
const Api = require('./api/Api');

const app = express();
const http = require('http').createServer(app);

const network = config.get('network');
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

http.listen(ports.images.static, network.host);
