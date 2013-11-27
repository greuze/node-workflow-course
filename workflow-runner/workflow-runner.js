var path = require('path'),
    fs = require('fs'),
    WorkflowRunner = require('wf').Runner;

if (process.argv.length < 2) {
    console.error('Usage: [node] ' + process.argv[1] + ' [path/to/config.json]');
    process.exit(1);
} else {
    var config_file;
    if (process.argv[2]) {
        config_file = path.resolve(process.argv[2]);
    } else {
        config_file = path.resolve(__dirname, 'config.json');
    }
    fs.readFile(config_file, 'utf8', function(err, data) {
        if (err) {
            console.error('Error reading config file:');
            console.dir(err);
            process.exit(1);
        } else {
            try {
                var config = JSON.parse(data);
            } catch (e) {
                console.error('Error parsing config file JSON:');
                console.dir(e);
                process.exit(1);
            }
            var runner = WorkflowRunner(config);
            runner.init(function(err) {
                if (err) {
                    console.error('Error initializing runner:');
                    console.dir(err);
                    process.exit(1);
                }
                runner.run();
                runner.log.info('Workflow Runner up!');
            });

            // Increase/decrease loggers levels using SIGUSR2/SIGUSR1:
            var sigyan = require('sigyan');
            sigyan.add([runner.log, runner.backend.log]);

            process.on('SIGINT', function() {
                console.log('Got SIGINT. Waiting for child processes to finish');
                runner.quit(function() {
                    console.log('All child processes finished. Exiting now.');
                    process.exit(0);
                });
            });

            process.on('SIGTERM', function() {
                console.log('Got SIGTERM. Finishing child processes');
                runner.kill(function() {
                    console.log('All child processes finished. Exiting now.');
                    process.exit(0);
                });
            });

        }
    });
}
