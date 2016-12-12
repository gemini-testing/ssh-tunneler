'use strict';

const Tunnel = require('./lib/tunnel');

module.exports = (hermione, opts) => {
    const tunnel = Tunnel.create(hermione.config, opts);

    if (!tunnel) {
        return;
    }

    hermione.on(hermione.events.RUNNER_START, () => tunnel.open());
    hermione.on(hermione.events.RUNNER_END, () => tunnel.close());
};
