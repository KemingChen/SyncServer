var SourceIP = process.argv[2];
var BaseDir = process.argv[3];
if (!SourceIP || !BaseDir) {
    return console.log("(SourceIP, BaseDir) parameter missing!");
}
console.log("SourceIP:", SourceIP);
console.log("BaseDir:", BaseDir);
console.log("start sync");

var exec = require("exec");
var fs = require("fs");
var request = require("request");
var backupFilename = "backup.zip";

requestTargetFiles();

function getUrlWithAction(action) {
    return "http://" + SourceIP + ":50000/" + action;
}

function requestBackupZip() {
    var setting = {
        method: 'GET',
        url: getUrlWithAction("sync"),
        encoding: null
    };

    request(setting, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            fs.writeFile(backupFilename, body, function() {
                unzip();
            });
        } else {
            console.log("sync error!!!");
        }
    });
}

function requestTargetFiles() {
    request(getUrlWithAction("targetFiles"), function(error, response, body) {
        if (!error && response.statusCode == 200) {
            targetFiles = JSON.parse(body);
            targetFiles.forEach(function(value) {
                console.log(value);
            });
        } else {
            console.log("sync error!!!");
        }
    });
}

function unzip() {
    exec(['unzip', "-qo", backupFilename, "-d", BaseDir], function(err, out, code) {
        if (err instanceof Error)
            throw err;
        process.stderr.write(err);
        process.stdout.write(out);
        fs.unlink(backupFilename, function(err) {
            if (err)
                throw err;
            console.log('finish sync!');
            process.exit(code);
        });
    });
}
