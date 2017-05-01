/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import * as firebase from "firebase/app";
import "firebase/database";

import { expect } from "chai";
import { timeout } from "../../constants-spec";
import { expectNoListeners } from "../../database/expect-spec";
import { app } from "../../firebase-spec";
import { ListEventObservable } from "./ListEventObservable";
import { Reference } from "../../database/types";

import "rxjs/add/operator/do";
import "rxjs/add/operator/map";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";
import "rxjs/add/operator/toArray";
import "rxjs/add/operator/toPromise";

describe("observable/database", function (): void {

    /*tslint:disable-next-line:no-invalid-this */
    this.timeout(timeout);

    describe("ListEventObservable", () => {

        let sequenceRef: Reference;

        beforeEach(() => {

            sequenceRef = app.database().ref("temp/sequence");
            return sequenceRef.set({
                a: 1,
                b: 2,
                c: 3
            });
        });

        it("should support loaded events", () => {

            return ListEventObservable.create(sequenceRef)
                .take(1)
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("list");
                    expect(event).to.have.property("prevKey", null);
                    expect(event).to.have.property("snapshot", null);
                    expect(event).to.have.property("type", "loaded");
                    expect(event.list).to.be.an("array");
                    expect(event.list).to.have.length(3);
                    expect(event.list.map((snapshot) => snapshot.key)).to.deep.equal(["a", "b", "c"]);
                    expectNoListeners(sequenceRef);
                });
        });

        it("should support added events", () => {

            return ListEventObservable.create(sequenceRef)
                .do((event) => {

                    // Need to wait until the initial list is loaded so that
                    // the any listeners invoked non-asynchronously by the
                    // update calls are not incorporated in the initial list.

                    if (event.type === "loaded") {
                        Promise
                            .resolve()
                            .then(() => sequenceRef.update({ d: 4 }));
                    }
                })
                .skip(1)
                .take(1)
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("list", null);
                    expect(event).to.have.property("prevKey", "c");
                    expect(event).to.have.property("snapshot");
                    expect(event).to.have.property("type", "added");
                    expect(event.snapshot).to.have.property("key", "d");
                    expectNoListeners(sequenceRef);
                });
        });

        it("should support changed events", () => {

            return ListEventObservable.create(sequenceRef)
                .do((event) => {

                    // Need to wait until the initial list is loaded so that
                    // the any listeners invoked non-asynchronously by the
                    // update calls are not incorporated in the initial list.

                    if (event.type === "loaded") {
                        Promise
                            .resolve()
                            .then(() => sequenceRef.update({ b: 0 }));
                    }
                })
                .skip(1)
                .take(1)
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("list", null);
                    expect(event).to.have.property("prevKey", "a");
                    expect(event).to.have.property("snapshot");
                    expect(event).to.have.property("type", "changed");
                    expect(event.snapshot).to.have.property("key", "b");
                    expectNoListeners(sequenceRef);
                });
        });

        it("should support removed events", () => {

            return ListEventObservable.create(sequenceRef)
                .do((event) => {

                    // Need to wait until the initial list is loaded so that
                    // the any listeners invoked non-asynchronously by the
                    // update calls are not incorporated in the initial list.

                    if (event.type === "loaded") {
                        Promise
                            .resolve()
                            .then(() => sequenceRef.update({ b: null }));
                    }
                })
                .skip(1)
                .take(1)
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("list", null);
                    expect(event).to.have.property("prevKey", null);
                    expect(event).to.have.property("snapshot");
                    expect(event).to.have.property("type", "removed");
                    expect(event.snapshot).to.have.property("key", "b");
                    expectNoListeners(sequenceRef);
                });
        });

        it("should support added events only", () => {

            return ListEventObservable.create(sequenceRef, { added: true })
                .take(3)
                .toArray()
                .toPromise()
                .then((events) => {

                    expect(events).to.be.an("array");
                    expect(events).to.have.length(3);
                    expect(events.map((event) => event.type)).to.deep.equal([
                        "added",
                        "added",
                        "added"
                    ]);
                    expectNoListeners(sequenceRef);
                });
        });

        it("should support changed events only", () => {

            let result = ListEventObservable.create(sequenceRef, { changed: true })
                .take(1)
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("type", "changed");
                    expectNoListeners(sequenceRef);
                });

            sequenceRef.once("value", () => { sequenceRef.update({ b: 0 }); });

            return result;
        });

        it("should support loaded events only (and should complete)", () => {

            return ListEventObservable.create(sequenceRef, { loaded: true })
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("type", "loaded");
                    expectNoListeners(sequenceRef);
                });
        });

        it("should support removed events only", () => {

            let result = ListEventObservable.create(sequenceRef, { removed: true })
                .take(1)
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("type", "removed");
                    expectNoListeners(sequenceRef);
                });

            sequenceRef.once("value", () => { sequenceRef.update({ b: null }); });

            return result;
        });

        it("should support lift", () => {

            const lifted = ListEventObservable.create(sequenceRef).map(Boolean);
            expect(lifted).to.be.an.instanceof(ListEventObservable);
            expect(lifted).to.have.property("query");
            expect(lifted).to.have.property("ref");
        });
    });
});
