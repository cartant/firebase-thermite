"use strict";

process.env.CHROME_BIN = require("puppeteer").executablePath();

exports = module.exports = function (config) {

    config.set({
        autoWatch: false,
        basePath: "",
        browsers: ["ChromeHeadless"],
        colors: true,
        concurrency: Infinity,
        exclude: [],
        files: [
            "node_modules/core-js/client/core.js",
            "node_modules/tslib/tslib.js",
            "node_modules/chai/chai.js",
            "node_modules/firebase/firebase.js",
            "node_modules/firebase-nightlight/bundles/firebase-nightlight.umd.js",
            "node_modules/rxjs/bundles/Rx.js",
            "bundles/firebase-thermite-test.umd.js"
        ],
        frameworks: ["mocha"],
        logLevel: config.LOG_INFO,
        port: 9876,
        preprocessors: {},
        proxies: {},
        reporters: ["spec"],
        singleRun: true
    });
};
