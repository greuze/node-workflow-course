var config = {
    "backend": {
        "module": "wf-redis-backend",
        "opts": {
            "port": 6379,
            "host": "127.0.0.1",
            "db": 11
        }
    },
    "credentials": {
    	"login": "greuze-test",
    	"password": "node-course-13"
    }
};

module.exports = config;