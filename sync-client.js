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

requestBackupFile({
    method: 'GET',
    url: "http://" + SourceIP + ":50000/sync",
    encoding: null
})

function requestBackupFile(setting) {
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

function unzip() {
    exec(['unzip', "-qo", backupFilename, "-d", BaseDir], function(err, out, code) {
        if (err instanceof Error)
            throw err;
        fs.unlink(backupFilename, function(err) {
            if (err)
                throw err;
            console.log('finish sync!');
        });
    });
}
