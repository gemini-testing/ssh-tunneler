'use strict';

const Tunnel = require('./lib/tunnel');

module.exports = (gemini, opts) => {
    // remove after https://github.com/gemini-testing/gemini/issues/555#issuecomment-263381235
    gemini.config.getBrowserIds().forEach((id) => {
        const browserConfig = gemini.config.forBrowser(id);

        Object.defineProperty(browserConfig, 'baseUrl', {
            get: () => browserConfig.rootUrl,
            set: (value) => browserConfig.rootUrl = value
        });
    });

    const tunnel = Tunnel.create(gemini.config, opts);

    if (!tunnel) {
        return;
    }

    gemini.on(gemini.events.START_RUNNER, () => tunnel.open());
    gemini.on(gemini.events.END_RUNNER, () => tunnel.close());
};
