'use strict';

const Promise = require('bluebird');
const tunnelProxy = require('../../gemini');
const Tunnel = require('../../lib/tunnel');
const utils = require('../utils');

const initTool = utils.initTool;
const defaults = utils.defaults;

const events = {
    START_RUNNER: 'fooBarStartRunner',
    END_RUNNER: 'fooBarEndRunner'
};

describe('gemini', () => {
    const sandbox = sinon.sandbox.create();

    let config;

    const initGemini = (conf) => initTool(events, conf || config);

    const initTunnelProxy = (gemini, opts) => tunnelProxy(gemini, opts || defaults());

    beforeEach(() => {
        config = {
            getBrowserIds: sandbox.stub().returns([]),
            forBrowser: sandbox.stub()
        };

        sandbox.spy(Tunnel, 'create');

        sandbox.stub(Tunnel.prototype, 'open');
        sandbox.stub(Tunnel.prototype, 'close');
    });

    afterEach(() => sandbox.restore());

    it('should do nothing if plugin is disabled', () => {
        const gemini = initGemini();

        initTunnelProxy(gemini, {enabled: false});

        gemini.emit(events.START_RUNNER);
        gemini.emit(events.END_RUNNER);

        assert.notCalled(Tunnel.prototype.open);
        assert.notCalled(Tunnel.prototype.close);
    });

    it('should decorate browser configs by "baseUrl" getter', () => {
        const browserConfig = {rootUrl: 'some-root-url'};

        config.getBrowserIds.returns(['bro']);
        config.forBrowser.withArgs('bro').returns(browserConfig);

        initTunnelProxy(initGemini(config));

        assert.equal(browserConfig.baseUrl, browserConfig.rootUrl);
    });

    it('should decorate browser configs by "baseUrl" setter', () => {
        const browserConfig = {rootUrl: 'some-root-url'};

        config.getBrowserIds.returns(['bro']);
        config.forBrowser.withArgs('bro').returns(browserConfig);

        initTunnelProxy(initGemini(config));

        browserConfig.baseUrl = 'another-root-url';

        assert.equal(browserConfig.rootUrl, 'another-root-url');
    });

    it('should create a tunnel instance', () => {
        const opts = defaults();
        const gemini = initGemini();

        initTunnelProxy(gemini, opts);

        assert.calledOnce(Tunnel.create);
        assert.calledWith(Tunnel.create, config, opts);
    });

    it('should open a tunnel on "START_RUNNER" event', () => {
        const gemini = initGemini();

        initTunnelProxy(gemini);

        Tunnel.prototype.open.returns(Promise.resolve('opened'));

        return assert.becomes(gemini.emitAndWait(events.START_RUNNER), ['opened']);
    });

    it('should close a tunnel on "END_RUNNER" event', () => {
        const gemini = initGemini();

        initTunnelProxy(gemini);

        Tunnel.prototype.close.returns(Promise.resolve('closed'));

        return assert.becomes(gemini.emitAndWait(events.END_RUNNER), ['closed']);
    });
});
