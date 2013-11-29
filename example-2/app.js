var express = require('express');
var http = require('http');
var Factory = require('wf').Factory;

var config = require('./config');
var aWorkflow = require('./gist-workflow');

var Backend = require(config.backend.module),
    backend = new Backend(config.backend.opts),
    factory;

var $login = config.credentials.login;
var $password = config.credentials.password;

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.use(app.router);
});

app.get(
    '/add-job',
    function(req, res, next) {
        var $content = req.param('content', null) || 'My content';

        var aJob = {
            target: '/gists',
            workflow: aWorkflow.uuid,
            params: {
                login: $login,
                password: $password,
                content: $content
            }
        };
        
        factory.job(aJob, function (err, job) {
            if (err) {
                console.error(err);
                res.json(err, 500);
            } else {
                res.json({'job-id' : job.uuid}, 200);
            }
            res.end();
        });
    }
);

app.get(
    '/get-job',
    function(req, res, next) {
        var jobId = req.param('job-id', null);
        if (jobId) {
            backend.getJob(jobId, function (err, obj) {
                if (err) {
                    console.error(err);
                    res.json(err, 500);
                } else {
                    res.json(obj, 200);
                }
            });            
        } else {
            res.send('No job id was specified', 400);
        }
    }
);

var createWorkflow = function() {
    backend.init(function () {
        factory = Factory(backend);

        backend.deleteWorkflow(aWorkflow, function(err) {
            if (err) {
                logger.error(err);
            } else {
                // Add the workflow to the factory
                factory.workflow(aWorkflow, function(err, wf) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("Added workflow '%s' (%s)", wf.name, wf.uuid);

                        // We can store the workflow UUID in any place. We need it to create jobs.
                        aWorkflow.uuid = wf.uuid;

                        http.createServer(app).listen(app.get('port'), function() {
                          console.log('Express server listening on port ' + app.get('port'));
                        });
                    }
                });
            }
        });
    });
};

createWorkflow();
