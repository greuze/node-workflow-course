// Usage example for wf using it as a node module to create
// workflows, queue jobs and obtain the results.

// NOTE it needs workflow-runner to be running before you
// run this file.

// Call from parent directory with:
//   `node app.js`

var util = require('util');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var Factory = require('wf').Factory;
var aWorkflow = require('./gist-workflow');
var config = require('./config');

var $login = config.credentials.login;
var $password = config.credentials.password;

aWorkflow.name = 'a gist created using wf module';

var config_file = path.normalize(__dirname + '/app-config.json');

var createGist = function() {
    var Backend = require(config.backend.module),
        backend = new Backend(config.backend.opts),
        factory;

    backend.init(function () {
        factory = Factory(backend);
        factory.workflow(aWorkflow, function (err, wf) {
            assert.ifError(err);
            assert.ok(wf);
            var aJob = {
                target: '/gists',
                workflow: wf.uuid,
                params: {
                    login: $login,
                    password: $password
                }
            };
            factory.job(aJob, function (err, job) {
                assert.ifError(err);
                assert.ok(job);
                assert.equal(job.execution, 'queued');
                assert.ok(job.uuid);

                var intervalId = setInterval(function () {
                    backend.getJob(job.uuid, function (err, obj) {
                        assert.ifError(err);
                        if (obj.execution === 'queued') {
                            console.log('Job waiting to be processed');
                        } else if (obj.execution === 'running') {
                            console.log('Job in progress ...');
                        } else {
                            console.log('Job finished. Here come the results:');
                            console.log(util.inspect(obj, false, 8));
                            // Only one workflow with the same name, need to
                            // delete it to allow creating it again:
                            backend.deleteWorkflow(wf, function (err, res) {
                                assert.ifError(err);
                                assert.ok(res);
                                clearInterval(intervalId);
                                process.exit(0);
                            });
                        }
                    });
                }, 3000);
            });
    });
  });
};

createGist();
