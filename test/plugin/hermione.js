'use strict';

const Promise = require('bluebird');
const tunnelProxy = require('../../hermione');
const Tunnel = require('../../lib/tunnel');
const utils = require('../utils');

const initTool = utils.initTool;
const defaults = utils.defaults;

const events = {
    RUNNER_START: 'fooBarStartRunner',
    RUNNER_END: 'fooBarEndRunner'
};

describe('gemini', () => {
    const sandbox = sinon.sandbox.create();

    const initHermione = (config) => initTool(events, config);

    const initTunnelProxy = (hermione, opts) => tunnelProxy(hermione, opts || defaults());

    beforeEach(() => {
        sandbox.spy(Tunnel, 'create');

        sandbox.stub(Tunnel.prototype, 'open');
        sandbox.stub(Tunnel.prototype, 'close');
    });

    afterEach(() => sandbox.restore());

    it('should do nothing if plugin is disabled', () => {
        const hermione = initHermione();

        initTunnelProxy(hermione, {enabled: false});

        hermione.emit(events.RUNNER_START);
        hermione.emit(events.RUNNER_END);

        assert.notCalled(Tunnel.prototype.open);
        assert.notCalled(Tunnel.prototype.close);
    });

    it('should create a tunnel instance', () => {
        const config = {hermione: 'config'};
        const opts = defaults();
        const hermione = initHermione(config);

        initTunnelProxy(hermione, opts);

        assert.calledOnce(Tunnel.create);
        assert.calledWith(Tunnel.create, config, opts);
    });

    it('should open a tunnel on "RUNNER_START" event', () => {
        const hermione = initHermione();

        initTunnelProxy(hermione);

        Tunnel.prototype.open.returns(Promise.resolve('opened'));

        return assert.becomes(hermione.emitAndWait(events.RUNNER_START), ['opened']);
    });

    it('should close a tunnel on "RUNNER_END" event', () => {
        const hermione = initHermione();

        initTunnelProxy(hermione);

        Tunnel.prototype.close.returns(Promise.resolve('closed'));

        return assert.becomes(hermione.emitAndWait(events.RUNNER_END), ['closed']);
    });
});
