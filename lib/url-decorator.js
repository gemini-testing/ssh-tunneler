'use strict';

const urijs = require('urijs');

const defaultDecorator = (uri, tunnel) => {
    return urijs(uri)
        .hostname(`${tunnel.host}`)
        .port(`${tunnel.port}`)
        .toString();
};

exports.create = (opts) => {
    opts = opts || {};

    const urlDecorator = opts.urlDecorator ? opts.urlDecorator : defaultDecorator;

    return (uri, tunnel) => {
        uri = opts.protocol ? urijs(uri).protocol(opts.protocol).toString() : uri;

        return urlDecorator(uri, tunnel);
    };
};
