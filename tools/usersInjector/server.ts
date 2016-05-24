import slci = require('@sealights/sl-cloud-infra');
import RoutesFactoryModule = require ("./lib/routesFactory");
import InjectorServiceModule = require('./injectorService');
import DBServicesModule = require('./lib/dbServices/usersInjectorDAL');
import dbFactoryModule = require('./lib/dbFactory');
import fs = require('fs');
var request = require('request');

var logger = new slci.Logger('toolsService', 'SL.Cloud.ToolsService');
process.on('uncaughtException', function(err) {
    logger.error("main", "uncaughtException", err.toString());
    if (err.stack) {
        logger.error("main", "uncaughtException", err.stack);
    }
    process.exit(1); //We want to avoid an unstable state caused by this error, e.g. a callback not being called which will leave the process hanging
});

var cfg = loadConfigFromFile() || loadConfigFromEnv();
verifyConfigKeys(cfg,["MONGODB_USERS_DB_HOST_ENV","MONGODB_USERS_DB_PORT_ENV", "MONGODB_USERS_DB_NAME_ENV"]);

process.on('uncaughtException', function(err) {
    logger.error("main", "uncaughtException", JSON.stringify(err, null, '\t'));
    process.exit(1); //We want to avoid an unstable state caused by this error, e.g. a callback not being called which will leave the process hanging
});

var dbFactory = new dbFactoryModule.DbFactory(cfg.MONGODB_USERS_DB_HOST_ENV,
    cfg.MONGODB_USERS_DB_PORT_ENV,
    cfg.MONGODB_USERS_DB_NAME_ENV,
    logger);

function loadConfigFromEnv() {
    var cfg = {
        SQS_TEST_FOOTPRINT_QUEUE: process.env.SQS_TEST_FOOTPRINT_QUEUE,
        SQS_BUILD_DIFF_QUEUE: process.env.SQS_BUILD_DIFF_QUEUE,
        SQS_TEST_SCORING_QUEUE: process.env.SQS_TEST_SCORING_QUEUE,
        SQS_READ_WRITE_ACCESS_KEY_ID_ENV: process.env.SQS_READ_WRITE_ACCESS_KEY_ID_ENV,
        SQS_READ_WRITE_SECRET_ACCESS_KEY_ENV: process.env.SQS_READ_WRITE_SECRET_ACCESS_KEY_ENV,
        SQS_REGION_ENV: process.env.SQS_REGION_ENV,
        AWS_ACCOUNT: process.env.AWS_ACCOUNT,
        S3_READ_WRITE_ACCESS_KEY_ID_ENV: process.env.S3_READ_WRITE_ACCESS_KEY_ID_ENV,
        S3_READ_WRITE_SECRET_ACCESS_KEY_ENV: process.env.S3_READ_WRITE_SECRET_ACCESS_KEY_ENV,
        S3_REGION_ENV: process.env.S3_REGION_ENV,
        MONGODB_USERS_DB_HOST_ENV: process.env.MONGODB_USERS_DB_HOST_ENV,
        MONGODB_USERS_DB_PORT_ENV: process.env. MONGODB_USERS_DB_PORT_ENV,
        MONGODB_USERS_DB_NAME_ENV: process.env.MONGODB_USERS_DB_NAME_ENV,
        USERS_SERVICE_PORT: process.env.USERS_SERVICE_PORT,
        TOOLS_SERVICE_PORT: process.env.TOOLS_SERVICE_PORT
    };
    console.log('Loaded configuration from environment variables');
    return cfg;
}
var usersInjectorServiceDAL = <DBServicesModule.IDAL>new DBServicesModule.UsersInjectorServiceDAL(logger);
var routesFactory = new RoutesFactoryModule.routesFactory();
var service = new InjectorServiceModule.InjectorService(routesFactory, usersInjectorServiceDAL, logger);
service.start(cfg.TOOLS_SERVICE_PORT);

function getConfigFilePath() {
    if (process.env.SL_CLOUD_CONFIG_JSON)
        return process.env.SL_CLOUD_CONFIG_JSON;
    if (process.argv.length < 3) return null;
    return process.argv[2];
}

function loadConfigFromFile() {
    var fn = getConfigFilePath();
    if (!fn) return null;
    try {
        console.log('Loading configuration from ' + fn);
        var cfg = JSON.parse(fs.readFileSync(fn).toString().trim());
        return cfg;
    } catch (e) {
        return null;
    }
}

function verifyConfigKeys(cfg, keyNames){
    for (var i=0 ; i<keyNames.length ; i++){
        var k = keyNames[i];
        if (cfg[k]===undefined)
            throw new Error("Configuration key "+k+" is required and was not specified");
    }
}