'use strict';

const _ = require('lodash');
const urijs = require('urijs');
const decorator = require('../../lib/url-decorator');

describe('url-decorator', () => {
    const tunnel = (opts) => _.defaults(opts || {}, {host: 'localhost', port: 8080});

    it('should not redefine protocol by default', () => {
        const decoratedUri = decorator.create()('https://host', tunnel());

        assert.equal(urijs(decoratedUri).protocol(), 'https');
    });

    it('should use protocol which is specified in options', () => {
        const decoratedUri = decorator.create({protocol: 'https'})('http://host', tunnel());

        assert.equal(urijs(decoratedUri).protocol(), 'https');
    });

    it('should redefine hostname on remote host name by default', () => {
        const decoratedUri = decorator.create()('//localhost', tunnel({host: 'remote-host'}));

        assert.equal(urijs(decoratedUri).hostname(), 'remote-host');
    });

    it('should redefine port on remote host port by default', () => {
        const decoratedUri = decorator.create()('//localhost:8080', tunnel({port: 443}));

        assert.equal(urijs(decoratedUri).port(), 443);
    });

    it('should use custom url decorator', () => {
        const createdTunnel = tunnel();
        const urlDecorator = sinon.stub().withArgs('//', createdTunnel).returns('custom-decorated-url');

        const decoratedUri = decorator.create({urlDecorator})('//', createdTunnel);

        assert.equal(decoratedUri, 'custom-decorated-url');
    });

    it('should apply protocol from options before custom url decorator', () => {
        const urlDecorator = sinon.stub();

        decorator.create({urlDecorator, protocol: 'https'})('http://host', tunnel());

        assert.calledWith(urlDecorator, sinon.match(/^https:\/\//));
    });
});
