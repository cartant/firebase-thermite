/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

"use strict";

const fs = require("fs");
const glob = require("glob");

const knownObservables = [
    "bindCallback",
    "bindNodeCallback",
    "combineLatest",
    "concat",
    "defer",
    "empty",
    "forkJoin",
    "from",
    "fromEvent",
    "fromEventPattern",
    "fromPromise",
    "if",
    "interval",
    "merge",
    "never",
    "of",
    "pairs",
    "range",
    "throw",
    "timer",
    "using",
    "zip"
];
const knownOperators = [
    "audit",
    "auditTime",
    "buffer",
    "bufferCount",
    "bufferTime",
    "bufferToggle",
    "bufferWhen",
    "catch",
    "combineAll",
    "combineLatest",
    "concat",
    "concatAll",
    "concatMap",
    "concatMapTo",
    "count",
    "debounce",
    "debounceTime",
    "defaultIfEmpty",
    "delay",
    "delayWhen",
    "dematerialize",
    "distinct",
    "distinctUntilChanged",
    "distinctUntilKeyChanged",
    "do",
    "elementAt",
    "every",
    "exhaust",
    "exhaustMap",
    "expand",
    "filter",
    "finally",
    "find",
    "findIndex",
    "first",
    "groupBy",
    "ignoreElements",
    "isEmpty",
    "last",
    "let",
    "map",
    "mapTo",
    "materialize",
    "max",
    "merge",
    "mergeAll",
    "mergeMap",
    "mergeMapTo",
    "mergeScan",
    "min",
    "multicast",
    "observeOn",
    "onErrorResumeNext",
    "pairwise",
    "partition",
    "pluck",
    "publish",
    "publishBehavior",
    "publishLast",
    "publishReplay",
    "race",
    "reduce",
    "repeat",
    "repeatWhen",
    "retry",
    "retryWhen",
    "sample",
    "sampleTime",
    "scan",
    "sequenceEqual",
    "share",
    "single",
    "skip",
    "skipUntil",
    "skipWhile",
    "startWith",
    "subscribeOn",
    "switch",
    "switchMap",
    "switchMapTo",
    "take",
    "takeLast",
    "takeUntil",
    "takeWhile",
    "throttle",
    "throttleTime",
    "timeInterval",
    "timeout",
    "timeoutWith",
    "timestamp",
    "toArray",
    "toPromise",
    "window",
    "windowCount",
    "windowTime",
    "windowToggle",
    "windowWhen",
    "withLatestFrom",
    "zip",
    "zipAll"
];
const otherMethods = {
    "concat": "array",
    "every": "array",
    "filter": "array",
    "find": "array",
    "findIndex": "array",
    "forEach": "array",
    "map": "array",
    "reduce": "array",
    "timeout": "mocha"
};

const importedObservableRegExp = /['"]rxjs\/add\/observable\/(\w+)['"]/g;
const importedOperatorRegExp = /['"]rxjs\/add\/operator\/(\w+)['"]/g;

glob("source/**/*.ts", (error, files) => {

    if (error) {
        throw error;
    } else {
        files.forEach(verify);
    }
});

function toLineNumber(input, index) {

    return input.substring(0, index).match(/\n/g).length + 1;
}

function toSeen(file, match, seen) {

    const index = match.index + match[0].indexOf(match[1]);

    if (seen && seen.findIndex((s) => s.index === index) !== -1) {
        return;
    }

    const from = match.input.lastIndexOf("\n", index);
    const to = match.input.indexOf("\n", index);

    return {
        file,
        index,
        line: toLineNumber(match.input, index),
        text: match.input
            .substring(from + 1, to)
            .replace(/^\s*/, "")
            .replace(/\s*$/, ""),
        name: match[1]
    };
}

function verify(file) {

    const content = fs.readFileSync(file).toString();

    const importedObservables = [];
    const importedOperators = [];

    let match;
    do {
        match = importedObservableRegExp.exec(content);
        if (match) {
            importedObservables.push(match[1]);
        }
    } while (match);

    do {
        match = importedOperatorRegExp.exec(content);
        if (match) {
            importedOperators.push(match[1]);
        }
    } while (match);

    const seenObservableRegExp = new RegExp(`Observable[\\n\\r\\s]*\\.(${knownObservables.join("|")})\\(`, "g");
    const seenOperatorRegExp = new RegExp(`\\.(${knownOperators.join("|")})\\(`, "g");
    const seenObservables = [];
    const seenOperators = [];

    do {
        match = seenObservableRegExp.exec(content);
        if (match) {
            seenObservables.push(toSeen(file, match));
        }
    } while (match);

    do {
        match = seenOperatorRegExp.exec(content);
        if (match) {
            const seen = toSeen(file, match, seenObservables);
            if (seen) {
                seenOperators.push(seen);
            }
        }
    } while (match);

    seenObservables.forEach((seen) => {
        if (importedObservables.indexOf(seen.name) === -1) {
            warn(seen);
        }
    });
    seenOperators.forEach((seen) => {
        if (importedOperators.indexOf(seen.name) === -1) {
            warn(seen);
        }
    });
}

function warn(seen) {
    const suffix = otherMethods[seen.name] ? ` (possible ${otherMethods[seen.name]} method)` : "";
    console.log(`No side effect import for \x1b[31m${seen.name}\x1b[0m found${suffix}:`);
    const text = seen.text.replace(new RegExp(`\\.${seen.name}`), `.\x1b[31m${seen.name}\x1b[32m`);
    console.log(`${seen.file}`);
    console.log(`Line ${seen.line}: \x1b[32m${text}\x1b[0m\n`);
}
