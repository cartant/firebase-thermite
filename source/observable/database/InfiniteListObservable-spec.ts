/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import * as firebase from "firebase/app";
import "firebase/database";

import { expect } from "chai";
import { Subject } from "rxjs/Subject";
import { timeout } from "../../constants-spec";
import { expectNoListeners } from "../../database/expect-spec";
import { app } from "../../firebase-spec";
import { InfiniteListObservable } from "./InfiniteListObservable";
import { selectValueWithKey } from "../../database/selectors";
import { Reference } from "../../database/types";
import { ValueWithKey } from "../../database/value-with-key";

import "rxjs/add/operator/map";
import "rxjs/add/operator/take";
import "rxjs/add/operator/toArray";
import "rxjs/add/operator/toPromise";

describe("observable/database", function (): void {

    /*tslint:disable-next-line:no-invalid-this */
    this.timeout(timeout);

    describe("InfiniteListObservable", () => {

        let bugRef: Reference;
        let sequenceRef: Reference;

        after(() => {

            bugRef.off();
        });

        before(() => {

            // It seems to be necessary to hold some 'on' listeners for the tests
            // to pass when 'realtime' is false. It's likely that this is related
            // to the Firebase SDK bug that was discussed here:
            // http://stackoverflow.com/a/41668776/6680611
            //
            // There is a test for the bug in:
            // plonk/lib/firebase/firebase-browser-spec.js
            //
            // As of 2017-03-10, it indicates that the bug has not yet been fixed.

            bugRef = app.database().ref("temp/sequence");
            bugRef.on("child_changed", () => {});
            bugRef.on("child_removed", () => {});
        });

        beforeEach(() => {

            let value: any = {
                "-KLDnr30------------": { number: 0 },
                "-KLDnr31------------": { number: -1 },
                "-KLDnr32------------": { number: -2 },
                "-KLDnr33------------": { number: -3 },
                "-KLDnr34------------": { number: -4 },
                "-KLDnr35------------": { number: -5 },
                "-KLDnr36------------": { number: -6 },
                "-KLDnr37------------": { number: -7 }
            };

            sequenceRef = app.database().ref("temp/sequence");
            return sequenceRef.set(value);
        });

        function specForwards(realtime: boolean): void {

            describe("lift", () => {

                it("should support lift", () => {

                    let notifier = new Subject();
                    const lifted = InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                        pageSize: 3,
                        realtime
                    }).map(Boolean);

                    expect(lifted).to.be.an.instanceof(InfiniteListObservable);
                    expect(lifted).to.have.property("query");
                    expect(lifted).to.have.property("ref");
                });
            });

            describe("forwards", () => {

                it("should default to orderByKey", () => {

                    let notifier = new Subject();
                    let result = InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                        pageSize: 3,
                        realtime
                    })
                    .take(3)
                    .toArray()
                    .toPromise()
                    .then((emits) => {

                        expect(emits).to.have.length(3);
                        expect(emits[0].map((element: any) => element.$key)).to.deep.equal([
                            "-KLDnr30------------",
                            "-KLDnr31------------",
                            "-KLDnr32------------"
                        ]);
                        expect(emits[1].map((element: any) => element.$key)).to.deep.equal([
                            "-KLDnr30------------",
                            "-KLDnr31------------",
                            "-KLDnr32------------",
                            "-KLDnr33------------",
                            "-KLDnr34------------",
                            "-KLDnr35------------"
                        ]);
                        expect(emits[2].map((element: any) => element.$key)).to.deep.equal([
                            "-KLDnr30------------",
                            "-KLDnr31------------",
                            "-KLDnr32------------",
                            "-KLDnr33------------",
                            "-KLDnr34------------",
                            "-KLDnr35------------",
                            "-KLDnr36------------",
                            "-KLDnr37------------"
                        ]);
                        expectNoListeners(sequenceRef);
                    });

                    notifier.next();
                    notifier.next();
                    notifier.next();

                    return result;
                });

                it("should support orderByChild", () => {

                    let notifier = new Subject();
                    let result = InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                        pageSize: 3,
                        query: { orderByChild: "number" },
                        realtime
                    })
                    .take(3)
                    .toArray()
                    .toPromise()
                    .then((emits) => {

                        expect(emits).to.have.length(3);
                        expect(emits[0].map((element: any) => element.$key)).to.deep.equal([
                            "-KLDnr37------------",
                            "-KLDnr36------------",
                            "-KLDnr35------------"
                        ]);
                        expect(emits[1].map((element: any) => element.$key)).to.deep.equal([
                            "-KLDnr37------------",
                            "-KLDnr36------------",
                            "-KLDnr35------------",
                            "-KLDnr34------------",
                            "-KLDnr33------------",
                            "-KLDnr32------------"
                        ]);
                        expect(emits[2].map((element: any) => element.$key)).to.deep.equal([
                            "-KLDnr37------------",
                            "-KLDnr36------------",
                            "-KLDnr35------------",
                            "-KLDnr34------------",
                            "-KLDnr33------------",
                            "-KLDnr32------------",
                            "-KLDnr31------------",
                            "-KLDnr30------------"
                        ]);
                        expectNoListeners(sequenceRef);
                    });

                    notifier.next();
                    notifier.next();
                    notifier.next();

                    return result;
                });

                it("should support orderByChild and startAt's optional key parameter", () => {

                    return app.database()
                        .ref("temp/sequence")
                        .set({
                            "-KLDnr30------------": { number: 0 },
                            "-KLDnr31------------": { number: 0 },
                            "-KLDnr32------------": { number: 0 },
                            "-KLDnr33------------": { number: 0 },
                            "-KLDnr34------------": { number: 1 },
                            "-KLDnr35------------": { number: 1 },
                            "-KLDnr36------------": { number: 1 },
                            "-KLDnr37------------": { number: 1 }
                        })
                        .then(() => {

                            let notifier = new Subject();
                            let result = InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                                pageSize: 3,
                                query: { orderByChild: "number" },
                                realtime
                            })
                            .take(3)
                            .toArray()
                            .toPromise()
                            .then((emits) => {

                                expect(emits).to.have.length(3);
                                expect(emits[0].map((element: any) => element.$key)).to.deep.equal([
                                    "-KLDnr30------------",
                                    "-KLDnr31------------",
                                    "-KLDnr32------------"
                                ]);
                                expect(emits[1].map((element: any) => element.$key)).to.deep.equal([
                                    "-KLDnr30------------",
                                    "-KLDnr31------------",
                                    "-KLDnr32------------",
                                    "-KLDnr33------------",
                                    "-KLDnr34------------",
                                    "-KLDnr35------------"
                                ]);
                                expect(emits[2].map((element: any) => element.$key)).to.deep.equal([
                                    "-KLDnr30------------",
                                    "-KLDnr31------------",
                                    "-KLDnr32------------",
                                    "-KLDnr33------------",
                                    "-KLDnr34------------",
                                    "-KLDnr35------------",
                                    "-KLDnr36------------",
                                    "-KLDnr37------------"
                                ]);
                                expectNoListeners(sequenceRef);
                            });

                            notifier.next();
                            notifier.next();
                            notifier.next();

                            return result;
                        });
                });

                it("should support an initially empty list", () => {

                    return sequenceRef
                        .remove()
                        .then(() => {

                            let notifier = new Subject();
                            let result = InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                                pageSize: 3,
                                realtime
                            })
                            .map((list, index) => {

                                if (index === 0) {
                                    Promise.resolve().then(() => {
                                        sequenceRef
                                            .set({
                                                "-KLDnr30------------": { number: 0 },
                                                "-KLDnr31------------": { number: -1 },
                                                "-KLDnr32------------": { number: -2 },
                                                "-KLDnr33------------": { number: -3 }
                                            })
                                            .then(() => notifier.next());
                                    });
                                }
                                return list;
                            })
                            .take(2)
                            .toArray()
                            .toPromise()
                            .then((emits) => {

                                expect(emits).to.have.length(2);
                                expect(emits[0].map((element: any) => element.$key)).to.deep.equal([]);
                                expect(emits[1].map((element: any) => element.$key)).to.deep.equal([
                                    "-KLDnr30------------",
                                    "-KLDnr31------------",
                                    "-KLDnr32------------"
                                ]);
                                expectNoListeners(sequenceRef);
                            });

                            notifier.next();

                            return result;
                        });
                });

                it("should always emit with each notification", () => {

                    return sequenceRef
                        .remove()
                        .then(() => {

                            let notifier = new Subject();
                            let result = InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                                pageSize: 3,
                                realtime
                            })
                            .take(3)
                            .toArray()
                            .toPromise()
                            .then((emits) => {

                                expect(emits).to.have.length(3);
                                expect(emits[0].map((element: any) => element.$key)).to.deep.equal([]);
                                expect(emits[1].map((element: any) => element.$key)).to.deep.equal([]);
                                expect(emits[2].map((element: any) => element.$key)).to.deep.equal([]);
                                expectNoListeners(sequenceRef);
                            });

                            notifier.next();
                            notifier.next();
                            notifier.next();

                            return result;
                        });
                });
            });
        }

        function specReverse(realtime: boolean): void {

            describe("reverse", () => {

                it("should default to orderByKey", () => {

                    let notifier = new Subject();
                    let result = InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                        pageSize: 3,
                        realtime,
                        reverse: true
                    })
                    .take(3)
                    .toArray()
                    .toPromise()
                    .then((emits) => {

                        expect(emits).to.have.length(3);
                        expect(emits[0].map((element: any) => element.$key)).to.deep.equal([
                            "-KLDnr37------------",
                            "-KLDnr36------------",
                            "-KLDnr35------------"
                        ]);
                        expect(emits[1].map((element: any) => element.$key)).to.deep.equal([
                            "-KLDnr37------------",
                            "-KLDnr36------------",
                            "-KLDnr35------------",
                            "-KLDnr34------------",
                            "-KLDnr33------------",
                            "-KLDnr32------------"
                        ]);
                        expect(emits[2].map((element: any) => element.$key)).to.deep.equal([
                            "-KLDnr37------------",
                            "-KLDnr36------------",
                            "-KLDnr35------------",
                            "-KLDnr34------------",
                            "-KLDnr33------------",
                            "-KLDnr32------------",
                            "-KLDnr31------------",
                            "-KLDnr30------------"
                        ]);
                        expectNoListeners(sequenceRef);
                    });

                    notifier.next();
                    notifier.next();
                    notifier.next();

                    return result;
                });

                it("should support orderByChild", () => {

                    let notifier = new Subject();
                    let result = InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                        pageSize: 3,
                        query: { orderByChild: "number" },
                        realtime,
                        reverse: true
                    })
                    .take(3)
                    .toArray()
                    .toPromise()
                    .then((emits) => {

                        expect(emits).to.have.length(3);
                        expect(emits[0].map((element: any) => element.$key)).to.deep.equal([
                            "-KLDnr30------------",
                            "-KLDnr31------------",
                            "-KLDnr32------------"
                        ]);
                        expect(emits[1].map((element: any) => element.$key)).to.deep.equal([
                            "-KLDnr30------------",
                            "-KLDnr31------------",
                            "-KLDnr32------------",
                            "-KLDnr33------------",
                            "-KLDnr34------------",
                            "-KLDnr35------------"
                        ]);
                        expect(emits[2].map((element: any) => element.$key)).to.deep.equal([
                            "-KLDnr30------------",
                            "-KLDnr31------------",
                            "-KLDnr32------------",
                            "-KLDnr33------------",
                            "-KLDnr34------------",
                            "-KLDnr35------------",
                            "-KLDnr36------------",
                            "-KLDnr37------------"
                        ]);
                        expectNoListeners(sequenceRef);
                    });

                    notifier.next();
                    notifier.next();
                    notifier.next();

                    return result;
                });

                it("should support orderByChild and startAt's optional key parameter", () => {

                    return app.database()
                        .ref("temp/sequence")
                        .set({
                            "-KLDnr30------------": { number: 0 },
                            "-KLDnr31------------": { number: 0 },
                            "-KLDnr32------------": { number: 0 },
                            "-KLDnr33------------": { number: 0 },
                            "-KLDnr34------------": { number: 1 },
                            "-KLDnr35------------": { number: 1 },
                            "-KLDnr36------------": { number: 1 },
                            "-KLDnr37------------": { number: 1 }
                        })
                        .then(() => {

                            let notifier = new Subject();
                            let result = InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                                pageSize: 3,
                                query: { orderByChild: "number" },
                                realtime,
                                reverse: true
                            })
                            .take(3)
                            .toArray()
                            .toPromise()
                            .then((emits) => {

                                expect(emits).to.have.length(3);
                                expect(emits[0].map((element: any) => element.$key)).to.deep.equal([
                                    "-KLDnr37------------",
                                    "-KLDnr36------------",
                                    "-KLDnr35------------"
                                ]);
                                expect(emits[1].map((element: any) => element.$key)).to.deep.equal([
                                    "-KLDnr37------------",
                                    "-KLDnr36------------",
                                    "-KLDnr35------------",
                                    "-KLDnr34------------",
                                    "-KLDnr33------------",
                                    "-KLDnr32------------"
                                ]);
                                expect(emits[2].map((element: any) => element.$key)).to.deep.equal([
                                    "-KLDnr37------------",
                                    "-KLDnr36------------",
                                    "-KLDnr35------------",
                                    "-KLDnr34------------",
                                    "-KLDnr33------------",
                                    "-KLDnr32------------",
                                    "-KLDnr31------------",
                                    "-KLDnr30------------"
                                ]);
                                expectNoListeners(sequenceRef);
                            });

                            notifier.next();
                            notifier.next();
                            notifier.next();

                            return result;
                        });
                });

                it("should support an initially empty list", () => {

                    return sequenceRef
                        .remove()
                        .then(() => {

                            let notifier = new Subject();
                            let result = InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                                pageSize: 3,
                                realtime,
                                reverse: true
                            })
                            .map((list, index) => {

                                if (index === 0) {
                                    Promise.resolve().then(() => {
                                        sequenceRef
                                            .set({
                                                "-KLDnr30------------": { number: 0 },
                                                "-KLDnr31------------": { number: -1 },
                                                "-KLDnr32------------": { number: -2 },
                                                "-KLDnr33------------": { number: -3 }
                                            })
                                            .then(() => notifier.next());
                                    });
                                }
                                return list;
                            })
                            .take(2)
                            .toArray()
                            .toPromise()
                            .then((emits) => {

                                expect(emits).to.have.length(2);
                                expect(emits[0].map((element: any) => element.$key)).to.deep.equal([]);
                                expect(emits[1].map((element: any) => element.$key)).to.deep.equal([
                                    "-KLDnr33------------",
                                    "-KLDnr32------------",
                                    "-KLDnr31------------"
                                ]);
                                expectNoListeners(sequenceRef);
                            });

                            notifier.next();

                            return result;
                        });
                });
            });
        }

        describe("realtime: false", () => {

            specForwards(false);
            specReverse(false);
        });

        describe("realtime: true", () => {

            specForwards(true);

            specReverse(true);

            describe("forwards", () => {

                it("should support adds", (_callback: Function) => {

                    let calls = 0;
                    function callback(error?: Error): void {
                        if (error) {
                            _callback(error);
                        } else if (++calls === 2) {
                            _callback();
                        }
                    }

                    let notifier = new Subject();
                    InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                        pageSize: 3,
                        realtime: true
                    })
                    .map((list, index) => {

                        if (index === 2) {
                            Promise.resolve().then(() => {
                                sequenceRef
                                    .update({
                                        "-KLDnr29------------": { number: 1 }
                                    })
                                    .then(callback)
                                    .catch(callback);
                            });
                        }
                        return list;
                    })
                    .skip(3)
                    .take(1)
                    .toPromise()
                    .then((emit) => {

                        expect(emit.map((element: any) => element.number)).to.deep.equal([
                            1, 0, -1, -2, -3, -4, -5, -6, -7
                        ]);
                        expectNoListeners(sequenceRef);
                        callback();
                    })
                    .catch(callback);

                    notifier.next();
                    notifier.next();
                    notifier.next();
                });

                it("should not add beyond the last element in a page", (_callback: Function) => {

                    let calls = 0;
                    function callback(error?: Error): void {
                        if (error) {
                            _callback(error);
                        } else if (++calls === 2) {
                            _callback();
                        }
                    }

                    let notifier = new Subject();
                    InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                        pageSize: 3,
                        realtime: true
                    })
                    .map((list, index) => {

                        if (index === 2) {
                            Promise.resolve().then(() => {
                                sequenceRef
                                    .update({
                                        "-KLDnr38------------": { number: -8 },
                                        "-KLDnr39------------": { number: -9 }
                                    })
                                    .then(() => notifier.next())
                                    .then(callback)
                                    .catch(callback);
                            });
                        }
                        return list;
                    })
                    .skip(3)
                    .take(1)
                    .toPromise()
                    .then((emit) => {

                        expect(emit.map((element: any) => element.number)).to.deep.equal([
                            0, -1, -2, -3, -4, -5, -6, -7, -8, -9
                        ]);
                        expectNoListeners(sequenceRef);
                        callback();
                    })
                    .catch(callback);

                    notifier.next();
                    notifier.next();
                    notifier.next();
                });

                it("should support changes", (_callback: Function) => {

                    let calls = 0;
                    function callback(error?: Error): void {
                        if (error) {
                            _callback(error);
                        } else if (++calls === 2) {
                            _callback();
                        }
                    }

                    let notifier = new Subject();
                    InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                        pageSize: 3,
                        realtime: true
                    })
                    .map((list, index) => {

                        if (index === 2) {
                            Promise.resolve().then(() => {
                                sequenceRef
                                    .update({
                                        "-KLDnr31------------": { number: 1 }
                                    })
                                    .then(callback)
                                    .catch(callback);
                            });
                        }
                        return list;
                    })
                    .skip(3)
                    .take(1)
                    .toPromise()
                    .then((emit) => {

                        expect(emit.map((element: any) => element.number)).to.deep.equal([
                            0, 1, -2, -3, -4, -5, -6, -7
                        ]);
                        expectNoListeners(sequenceRef);
                        callback();
                    })
                    .catch(callback);

                    notifier.next();
                    notifier.next();
                    notifier.next();
                });

                it("should support removes", (_callback: Function) => {

                    let calls = 0;
                    function callback(error?: Error): void {
                        if (error) {
                            _callback(error);
                        } else if (++calls === 2) {
                            _callback();
                        }
                    }

                    let notifier = new Subject();
                    InfiniteListObservable.create(sequenceRef, notifier, selectValueWithKey, {
                        pageSize: 3,
                        realtime: true
                    })
                    .map((list, index) => {

                        if (index === 2) {
                            Promise.resolve().then(() => {
                                sequenceRef
                                    .update({
                                        "-KLDnr31------------": null
                                    })
                                    .then(callback)
                                    .catch(callback);
                            });
                        }
                        return list;
                    })
                    .skip(3)
                    .take(1)
                    .toPromise()
                    .then((emit) => {

                        expect(emit.map((element: any) => element.number)).to.deep.equal([
                            0, -2, -3, -4, -5, -6, -7
                        ]);
                        expectNoListeners(sequenceRef);
                        callback();
                    })
                    .catch(callback);

                    notifier.next();
                    notifier.next();
                    notifier.next();
                });
            });
        });
    });
});
