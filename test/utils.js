'use strict';

const AsyncEmitter = require('gemini-core').AsyncEmitter;

exports.initTool = (events, config) => {
    const tool = new AsyncEmitter();

    tool.events = events;
    tool.config = config;

    return tool;
};

exports.defaults = () => ({host: 'localhost', ports: {min: 0, max: 1}, localport: 8080});
