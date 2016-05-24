var fs = require('fs'), 
    http = require('https');
var APPNAME = "sealights-sl-cloud-tools-service";
var SEALIGHTS_SERVER = "https://prod-eu-a-gw.sealights.co/api"; //If https, update the require() above
var SEALIGHTS_CUSTOMER_ID = "SeaLights"
var TECHNOLOGY = "nodejs";

function httpGet(url, callback) {    
    http.get(url, function(response){
        var body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            var parsed;
            if (body.length>0)
                parsed = JSON.parse(body);
            callback(parsed);
        });
    });
}

function projectTaskBuilder(context, taskFactory) {

    var buildSteps = [], prePackSteps = [], packSteps = [], testSteps = [], qualityEvaluationSteps = [];

    buildSteps.push(taskFactory.createShellTask('fetch latest sane cloud infra','/opt/sl-repo/node_modules/.bin/sl_repo', [
        "download-component",
        "--name","sealights-sl-cloud-infra",
        "--targetFilename", "infra.tgz"]));
    buildSteps.push(taskFactory.createShellTask('install latest sane cloud infra','npm',['install','infra.tgz']));
    buildSteps.push(taskFactory.createShellTask('Install npm dependencies','npm',['install']));

    buildSteps.push(taskFactory.createShellTask('compile typescript files', 'tsc', ['-p', '.']));
    //SeaLights build agent installation
    buildSteps.push(taskFactory.createShellTask('Install SeaLights build agent','npm',['install','@sealights/sl-cia']));
    buildSteps.push(taskFactory.createShellTask('Configure SeaLights build agent','node_modules/.bin/sl-config-cia',['--server',SEALIGHTS_SERVER,"--customerid",SEALIGHTS_CUSTOMER_ID]));

    var branchName = "pull-request-"+context.pullReq.pullReqNum+"("+context.build+")"; //should be unique
    buildSteps.push(taskFactory.createShellTask('Run SeaLights build agent','node_modules/.bin/sl-cia',['--branch',branchName,"--build","1","--appname",APPNAME,"--workspacepath",".","--technology",TECHNOLOGY,"--scm","git"],{env:{"NODE_DEBUG":"sl"}}));
    
    prePackSteps.push(taskFactory.createShellTask('Install mocha','npm',['install','mocha']));
    prePackSteps.push(taskFactory.createShellTask('Install nodejs agent','npm',['install',"@sealights/sl-node", "@sealights/sl-node-mocha"]));
    
    prePackSteps.push(taskFactory.createShellTask('Configure nodejs agent','node_modules/.bin/sl-config',['--server',SEALIGHTS_SERVER,"--customerid",SEALIGHTS_CUSTOMER_ID,"--appname",APPNAME,"--env","Unit Tests","--branch",branchName,"--build","1"]));
    prePackSteps.push(taskFactory.createShellTask('Configure mocha','cp',["node_modules/@sealights/sl-node-mocha/integration/_sealights_mocha.js","test/_sealights_mocha.js"]));
    prePackSteps.push(taskFactory.createShellTask('Run unit tests','node',['node_modules/@sealights/sl-node-cover/tools/cli.js','cover','./node_modules/mocha/bin/_mocha','--','-R','@sealights/sl-node-mocha','test/unitTest','--recursive'],{env:{"NODE_DEBUG":"sl"}}));

    // prePackSteps.push(taskFactory.createShellTask('Configure nodejs agent','node_modules/.bin/sl-config',['--server',SEALIGHTS_SERVER,"--customerid",SEALIGHTS_CUSTOMER_ID,"--appname",APPNAME,"--env","Comp Tests","--branch",branchName,"--build","1"]));
    // prePackSteps.push(taskFactory.createShellTask('Configure mocha','cp',["node_modules/@sealights/sl-node-mocha/integration/_sealights_mocha.js","test/component/_sealights_mocha.js"]));
    // prePackSteps.push(taskFactory.createShellTask('Run component tests','node',['node_modules/@sealights/sl-node-cover/tools/cli.js','cover','./node_modules/mocha/bin/_mocha','--','-R','@sealights/sl-node-mocha','test/component','--recursive'],{env:{"NODE_DEBUG":"sl"}}));

    qualityEvaluationSteps.push(taskFactory.createFunctionTask('Wait 10 seconds before getting quality holes',function(callback)
    {
        setTimeout(callback, 10*1000);
    }));
    qualityEvaluationSteps.push(taskFactory.createFunctionTask('Evaluate build score for Unit Tests',function(callback)
        {            
            //http://prod-eu-a.sealights.co:8080/builds/qualityHoles?customer=SeaLights&build=1&branch=pull-request-22(144)&component=sealights-sl-cloud-gateway&env=Unit%20Tests
            var url = SEALIGHTS_SERVER+'/v1/qualityholes';

            var dict = {};
            dict.customer=SEALIGHTS_CUSTOMER_ID;
            dict.build=1;
            dict.branch=branchName;
            dict.component=APPNAME;
            dict.environment='Unit Tests';

            var queryString = "?" + Object.keys(dict).map(function (k) {
                return k + "=" + encodeURIComponent(dict[k]);
            }).join('&');
            var urlWithQuery = url + queryString;

            console.log('Getting quality holes from '+urlWithQuery);
            httpGet(urlWithQuery, function(data){
                console.log('Quality holes result: '+JSON.stringify(data));
                try{
                    var dataAsJson = data;//JSON.parse(data);
                    if (dataAsJson && dataAsJson.length>0)
                        callback(dataAsJson.length+' quality holes found');
                    else
                    {
                        console.log('No quality holes found. Good job!');
                        callback();
                    }
                } catch(e){
                    console.log('returned data was not valid JSON');
                    callback(e);
                }                
            });
        }));

    return {
        build: buildSteps,
        prepack: prePackSteps,
        pack: packSteps,
        test: testSteps,
        qualityEvaluation: qualityEvaluationSteps
    }
}

module.exports = projectTaskBuilder;
