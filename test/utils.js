'use strict';

const QEmitter = require('qemitter');

exports.initTool = (events, config) => {
    const tool = new QEmitter();

    tool.events = events;
    tool.config = config;

    return tool;
};

exports.defaults = () => ({host: 'localhost', ports: {min: 0, max: 1}, localport: 8080});
