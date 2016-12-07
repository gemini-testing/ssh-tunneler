'use strict';

const Promise = require('bluebird');
const SSHTunnel = require('ssh-tun');
const Tunnel = require('../../lib/tunnel');
const urlDecorator = require('../../lib/url-decorator');
const defaults = require('../utils').defaults;

describe('Tunnel', () => {
    const sandbox = sinon.sandbox.create();

    let config;
    let decorator;

    const createTunnel = (opts) => Tunnel.create(config, opts || defaults());

    beforeEach(() => {
        decorator = sandbox.stub();

        config = {
            getBrowserIds: sandbox.stub().returns([]),
            forBrowser: sandbox.stub()
        };

        sandbox.stub(SSHTunnel, 'openWithRetries').returns(Promise.resolve());
        sandbox.stub(urlDecorator, 'create').returns(decorator);
    });

    afterEach(() => sandbox.restore());

    describe('.create', () => {
        it('should not create an instance if passed options are on in object notation', () => {
            assert.isUndefined(createTunnel('Not an object!'));
        });

        it('should not create an instance if tunnel is explicitly disabled via options', () => {
            assert.isUndefined(createTunnel({enabled: false}));
        });

        it('should create url decorator', () => {
            const opts = defaults();
            createTunnel(opts);

            assert.calledOnce(urlDecorator.create);
            assert.calledWith(urlDecorator.create, defaults());
        });

        it('should return a tunnel instance', () => {
            assert.instanceOf(createTunnel(), Tunnel);
        });
    });

    describe('constructor', () => {
        ['host', 'ports', 'localport'].forEach((option) => {
            it(`should throw on missing option "${option}"`, () => {
                const opts = defaults();

                delete opts[option];

                assert.throws(() => createTunnel(opts), `Missing the required option "${option}"`);
            });
        });

        it('should throw if "urlDecorator" is not a function', () => {
            const opts = defaults();

            opts.urlDecorator = 'I am not a function';

            assert.throws(() => createTunnel(opts), '"urlDecorator" should be a function');
        });
    });

    describe('.prototype', () => {
        describe('.open', () => {
            beforeEach(() => {
                config.getBrowserIds.returns(['default-browser']);
                config.forBrowser.returns({});
            });

            it('should open ssh tunnel with retries', () => {
                const opts = defaults();

                opts.retries = 100500;

                return createTunnel(opts).open()
                    .then(() => {
                        assert.calledOnce(SSHTunnel.openWithRetries);
                        assert.calledWith(SSHTunnel.openWithRetries, opts, 100500);
                    });
            });

            it('should decorate base urls of browsers', () => {
                const broConfig = {baseUrl: 'http://localhost:8081'};

                config.getBrowserIds.returns(['bro']);
                config.forBrowser.withArgs('bro').returns(broConfig);

                decorator.withArgs(broConfig.baseUrl).returns('http://hostlocal:8180');

                return createTunnel().open()
                    .then(() => assert.deepEqual(broConfig, {baseUrl: 'http://hostlocal:8180'}));
            });

            it('should call a decorator with a created tunnel', () => {
                SSHTunnel.openWithRetries.returns(Promise.resolve({created: 'tunnel'}));

                return createTunnel().open()
                    .then(() => assert.calledWith(decorator, sinon.match.any, {created: 'tunnel'}));
            });
        });

        describe('.close', () => {
            it('should not try to close tunnel which has not been opened yet', () => {
                assert.isNull(createTunnel().close());
            });

            it('should close ssh tunnel', () => {
                const created = {close: sandbox.stub()};

                SSHTunnel.openWithRetries.returns(Promise.resolve(created));

                const tunnel = createTunnel();

                return tunnel.open()
                    .then(() => tunnel.close())
                    .then(() => assert.calledOnce(created.close));
            });
        });
    });
});
