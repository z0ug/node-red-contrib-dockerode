"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function (RED) {
    function DockerConfigAction(n) {
        var _this = this;
        RED.nodes.createNode(this, n);
        var config = RED.nodes.getNode(n.config);
        var client = config.getClient();
        this.on('input', function (msg) {
            RED.log.debug(msg);
            var configId = n.configId || msg.payload.configId || msg.configId || undefined;
            var action = n.action || msg.action || msg.payload.action || undefined;
            if (configId === undefined && !['list'].includes(action)) {
                _this.error("Config id/name must be provided via configuration or via `msg.config`");
                return;
            }
            _this.status({});
            executeAction(configId, client, action, _this, msg);
        });
        function executeAction(configId, client, action, node, msg) {
            var config = client.getConfig(configId);
            switch (action) {
                case 'list':
                    // https://docs.docker.com/engine/api/v1.40/#operation/ConfigList
                    client.listConfigs({ all: true })
                        .then(function (res) {
                        node.status({ fill: 'green', shape: 'dot', text: configId + ' started' });
                        node.send(Object.assign(msg, { payload: res }));
                    }).catch(function (err) {
                        if (err.statusCode === 400) {
                            node.error("Bad parameter:  " + err.reason);
                            node.send({ payload: err });
                        }
                        else if (err.statusCode === 500) {
                            node.error("Server Error: [" + err.statusCode + "] " + err.reason);
                            node.send({ payload: err });
                        }
                        else {
                            node.error("Sytem Error:  [" + err.statusCode + "] " + err.reason);
                            return;
                        }
                    });
                    break;
                /*
                //TODO: locate in dockerode
                                    case 'create':
                                        // https://docs.docker.com/engine/api/v1.40/#operation/ConfigCreate
                                        config.
                                            .then(res => {
                                                node.status({ fill: 'green', shape: 'dot', text: configId + ' remove' });
                                                node.send(Object.assign(msg,{ payload: res }));
                                            }).catch(err => {
                                                if (err.statusCode === 500) {
                                                    node.error(`Server Error: [${err.statusCode}] ${err.reason}`);
                                                    node.send({ payload: err });
                                                } else if (err.statusCode === 409) {
                                                    node.error(`Name conflicts with an existing objectd: [${configId}]`);
                                                    node.send({ payload: err });
                                                } else {
                                                    node.error(`Sytem Error:  [${err.statusCode}] ${err.reason}`);
                                                    return;
                                                }
                                            });
                                        break;
                */
                case 'inspect':
                    // https://docs.docker.com/engine/api/v1.40/#operation/ConfigInspect
                    config.inspect()
                        .then(function (res) {
                        node.status({ fill: 'green', shape: 'dot', text: configId + ' started' });
                        node.send(Object.assign(msg, { payload: res }));
                    }).catch(function (err) {
                        if (err.statusCode === 503) {
                            node.error("Node is not part of a swarm: [" + configId + "]");
                            node.send({ payload: err });
                        }
                        else if (err.statusCode === 404) {
                            node.error("Config not found: [" + configId + "]");
                            node.send({ payload: err });
                        }
                        else if (err.statusCode === 500) {
                            node.error("Server Error: [" + err.statusCode + "] " + err.reason);
                            node.send({ payload: err });
                        }
                        else {
                            node.error("Sytem Error:  [" + err.statusCode + "] " + err.reason);
                            return;
                        }
                    });
                    break;
                case 'remove':
                    // https://docs.docker.com/engine/api/v1.40/#operation/ConfigDelete
                    config.remove()
                        .then(function (res) {
                        node.status({ fill: 'green', shape: 'dot', text: configId + ' remove' });
                        node.send(Object.assign(msg, { payload: res }));
                    }).catch(function (err) {
                        if (err.statusCode === 503) {
                            node.error("Node is not part of a swarm: [" + configId + "]");
                            node.send({ payload: err });
                        }
                        else if (err.statusCode === 404) {
                            node.error("Config not found: [" + configId + "]");
                            node.send({ payload: err });
                        }
                        else if (err.statusCode === 500) {
                            node.error("Server Error: [" + err.statusCode + "] " + err.reason);
                            node.send({ payload: err });
                        }
                        else {
                            node.error("Sytem Error:  [" + err.statusCode + "] " + err.reason);
                            return;
                        }
                    });
                    break;
                case 'update':
                    // https://docs.docker.com/engine/api/v1.40/#operation/ConfigUpdate
                    config.update()
                        .then(function (res) {
                        node.status({ fill: 'green', shape: 'dot', text: configId + ' remove' });
                        node.send(Object.assign(msg, { payload: res }));
                    }).catch(function (err) {
                        if (err.statusCode === 503) {
                            node.error("Node is not part of a swarm: [" + configId + "]");
                            node.send({ payload: err });
                        }
                        else if (err.statusCode === 400) {
                            node.error("Bad parameter: [" + configId + "]");
                            node.send({ payload: err });
                        }
                        else if (err.statusCode === 404) {
                            node.error("Config not found: [" + configId + "]");
                            node.send({ payload: err });
                        }
                        else if (err.statusCode === 500) {
                            node.error("Server Error: [" + err.statusCode + "] " + err.reason);
                            node.send({ payload: err });
                        }
                        else {
                            node.error("Sytem Error:  [" + err.statusCode + "] " + err.reason);
                            return;
                        }
                    });
                    break;
                default:
                    node.error("Called with an unknown action: " + action);
                    return;
            }
        }
    }
    RED.nodes.registerType('docker-config-actions', DockerConfigAction);
};
