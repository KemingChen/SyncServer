var ConfigPath = process.argv[2];
if (!ConfigPath) {
    return console.log("(ConfigPath) parameter missing!");
}
console.log("Config Path:", ConfigPath);

var Archive = require("./node-zip-archive");
var fs = require('fs');
var express = require('express');

var config = require('./' + ConfigPath);

(new Archive(config.BaseDir)).addFiles(config.TargetFiles, function(zip) {
    zip.toBuffer(function(buffer, err) {
        if (!err) {
            var app = express();
            app.get('/sync', function(req, res) {
                res.setHeader('Content-disposition', 'attachment; filename=backup.zip');
                res.send(buffer);
            });
            app.get('/targetFiles', function(req, res) {
                res.send(config.TargetFiles);
            });
            var server = app.listen(50000, '0.0.0.0', function() {
                console.log("Start Server Finished!!!");
            });
        }
    });
});
