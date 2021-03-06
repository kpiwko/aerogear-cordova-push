module.exports = function(ctx) {
    var fs = ctx.requireCordovaModule('fs'),
        path = ctx.requireCordovaModule('path'),
        os = require("os"),
        deferral = ctx.requireCordovaModule('q').defer();

    var platformRoot = path.join(ctx.opts.projectRoot, 'www');
    var settingsFile = path.join(platformRoot, 'google-services.json');

    fs.stat(settingsFile, function(err,stats) {
        if (err) {
            deferral.reject("To use this plugin on android you'll need to add a google-services.json file with the FCM project_info and place that into your www folder");
        } else {
            fs.createReadStream(settingsFile).pipe(fs.createWriteStream('platforms/android/google-services.json'));

            fs.readFileSync('platforms/android/build.gradle').toString().split(os.EOL).forEach(function (line) {
                fs.appendFileSync('./build.gradle', line.toString() + os.EOL);
                if (/.*\ dependencies \{.*/.test(line)) {
                    fs.appendFileSync('./build.gradle', '\t\tclasspath "com.google.gms:google-services:3.0.0"' + os.EOL);
                    fs.appendFileSync('./build.gradle', '\t\tclasspath "com.android.tools.build:gradle:1.2.3+"' + os.EOL);
                }
            });

            fs.rename('./build.gradle', 'platforms/android/build.gradle', deferral.resolve);
        }
    });

    return deferral.promise;
};