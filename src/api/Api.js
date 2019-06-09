/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
const uniqid = require('uniqid');
const BaseApi = require('../../../social-deployment/templates/nodejs/api/BaseApi');

class Api extends BaseApi {
    constructor(sockets) {
        super(sockets);
    }

    test() {
        console.log(this);
    }
}

module.exports = Api;
