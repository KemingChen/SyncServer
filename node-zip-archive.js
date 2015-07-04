var walk = require('walk');
var fs = require("fs");
var Zip = require("node-native-zip");

module.exports = (function(baseDir) {
    _self = this;

    _self.baseDir = baseDir ? baseDir : __dirname + "/";
    _self.batchFiles = [];
    _self.files = [];
    _self.zip = new Zip();

    function navigation(callback) {
        if (_self.files.length > 0) {
            var path = _self.baseDir + _self.files.pop();

            try {
                if (fs.lstatSync(path).isDirectory()) {
                    addLocalFolder(path, callback);

                } else {
                    addLocalFile(path);
                    navigation(callback);
                }
            } catch (e) {
                addErrorFile(e.path);
                navigation(callback);
            }

        } else {
            callback(_self.archive);
        }
    }

    function addLocalFolder(path, callback) {
        var walker = walk.walk(path, {
            followLinks: false
        });

        walker.on('file', function(root, stat, next) {
            path = root + '/' + stat.name;
            addLocalFile(path);
            next();
        });

        walker.on('end', function() {
            navigation(callback);
        });
    }

    function addErrorFile(path) {
        console.log("error", path);
        var buffer = new Buffer("Not Found File in " + path, "utf8");
        var filename = path.replace(_self.baseDir, "") + ".error.txt";
        _self.zip.add(filename, buffer);
    }

    function addLocalFile(path) {
        console.log("add", path);
        _self.batchFiles.push({
            name: path.replace(_self.baseDir, ""),
            path: path
        });
    }

    function update(callback) {
        _self.zip.addFiles(_self.batchFiles, function(err) {
            _self.batchFiles = [];
            if (err)
                callback(null, err);

            callback(_self.zip.toBuffer())
        });
    }

    return _self.archive = {
        addFiles: function(files, callback) {
            _self.files = files;
            navigation(callback);
        },
        save: function(filename, callback) {
            update(function(buffer, err) {
                if (err) {
                    console.log("Create Archive Error!!!", err);
                    callback(err);
                    return;
                }

                fs.writeFile(filename, buffer, function() {
                    callback();
                });
            });
        },
        toBuffer: function(callback) {
            update(callback);
        },
    }
});