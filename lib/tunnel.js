'use strict';

const _ = require('lodash');
const SSHTunnel = require('ssh-tun');
const urlDecorator = require('./url-decorator');

const REQUIRED_OPTS = ['host', 'ports', 'localport'];

module.exports = class Tunnel {
    static create(config, opts) {
        if (!_.isObject(opts) || opts.enabled === false) {
            return;
        }

        return new this(config, opts);
    }

    constructor(config, opts) {
        Tunnel._validateOpts(opts);

        this._config = config;
        this._opts = opts;

        this._decorateUrl = urlDecorator.create(opts);

        this._sshTunnel = null;
    }

    static _validateOpts(opts) {
        REQUIRED_OPTS.forEach((option) => {
            if (!opts[option]) {
                throw new Error(`Missing the required option "${option}"`);
            }
        });

        if (opts.urlDecorator && !_.isFunction(opts.urlDecorator)) {
            throw new Error('"urlDecorator" should be a function');
        }
    }

    open() {
        return SSHTunnel.openWithRetries(this._opts, this._opts.retries)
            .then((sshTunnel) => this._sshTunnel = sshTunnel)
            .then(() => this._redefineBaseUrls());
    }

    _redefineBaseUrls() {
        this._config.getBrowserIds().forEach((browserId) => {
            const baseUrl = this._config.forBrowser(browserId).baseUrl;

            this._config.forBrowser(browserId).baseUrl = this._decorateUrl(baseUrl, this._sshTunnel);
        });
    }

    close() {
        return this._sshTunnel && this._sshTunnel.close();
    }
};
