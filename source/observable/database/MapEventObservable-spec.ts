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
import { MapEventObservable } from "./MapEventObservable";
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

    describe("MapEventObservable", () => {

        let entityRef: Reference;

        beforeEach(() => {

            entityRef = app.database().ref("temp/entity");
            return entityRef.set({
                a: 1,
                b: 2,
                c: 3
            });
        });

        it("should support loaded events", () => {

            return MapEventObservable.create(entityRef)
                .take(1)
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("map");
                    expect(event).to.have.property("snapshot", null);
                    expect(event).to.have.property("type", "loaded");
                    expect(event.map).to.be.an("object");

                    const keys = Object.keys(event.map);
                    keys.sort();

                    expect(keys).to.have.length(3);
                    expect(keys).to.deep.equal(["a", "b", "c"]);
                    expectNoListeners(entityRef);
                });
        });

        it("should support added events", () => {

            return MapEventObservable.create(entityRef)
                .do((event) => {

                    // Need to wait until the initial list is loaded so that
                    // the any listeners invoked non-asynchronously by the
                    // update calls are not incorporated in the initial list.

                    if (event.type === "loaded") {
                        Promise
                            .resolve()
                            .then(() => entityRef.update({ d: 4 }));
                    }
                })
                .skip(1)
                .take(1)
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("map", null);
                    expect(event).to.have.property("snapshot");
                    expect(event).to.have.property("type", "added");
                    expect(event.snapshot).to.have.property("key", "d");
                    expectNoListeners(entityRef);
                });
        });

        it("should support changed events", () => {

            return MapEventObservable.create(entityRef)
                .do((event) => {

                    // Need to wait until the initial list is loaded so that
                    // the any listeners invoked non-asynchronously by the
                    // update calls are not incorporated in the initial list.

                    if (event.type === "loaded") {
                        Promise
                            .resolve()
                            .then(() => entityRef.update({ b: 0 }));
                    }
                })
                .skip(1)
                .take(1)
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("map", null);
                    expect(event).to.have.property("snapshot");
                    expect(event).to.have.property("type", "changed");
                    expect(event.snapshot).to.have.property("key", "b");
                    expectNoListeners(entityRef);
                });
        });

        it("should support removed events", () => {

            return MapEventObservable.create(entityRef)
                .do((event) => {

                    // Need to wait until the initial list is loaded so that
                    // the any listeners invoked non-asynchronously by the
                    // update calls are not incorporated in the initial list.

                    if (event.type === "loaded") {
                        Promise
                            .resolve()
                            .then(() => entityRef.update({ b: null }));
                    }
                })
                .skip(1)
                .take(1)
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("map", null);
                    expect(event).to.have.property("snapshot");
                    expect(event).to.have.property("type", "removed");
                    expect(event.snapshot).to.have.property("key", "b");
                    expectNoListeners(entityRef);
                });
        });

        it("should support added events only", () => {

            return MapEventObservable.create(entityRef, { added: true })
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
                    expectNoListeners(entityRef);
                });
        });

        it("should support changed events only", () => {

            let result = MapEventObservable.create(entityRef, { changed: true })
                .take(1)
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("type", "changed");
                    expectNoListeners(entityRef);
                });

            entityRef.once("value", () => { entityRef.update({ b: 0 }); });

            return result;
        });

        it("should support loaded events only (and should complete)", () => {

            return MapEventObservable.create(entityRef, { loaded: true })
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("type", "loaded");
                    expectNoListeners(entityRef);
                });
        });

        it("should support removed events only", () => {

            let result = MapEventObservable.create(entityRef, { removed: true })
                .take(1)
                .toPromise()
                .then((event) => {

                    expect(event).to.be.an("object");
                    expect(event).to.have.property("type", "removed");
                    expectNoListeners(entityRef);
                });

            entityRef.once("value", () => { entityRef.update({ b: null }); });

            return result;
        });

        it("should support lift", () => {

            const lifted = MapEventObservable.create(entityRef).map(Boolean);
            expect(lifted).to.be.an.instanceof(MapEventObservable);
            expect(lifted).to.have.property("query");
            expect(lifted).to.have.property("ref");
        });

        describe("reducers", () => {

            function toSnapshot(key: string, value: number): any {

                return { key, value };
            }

            function toValue(snapshot: any): any {

                return snapshot.value;
            }

            describe("onAdded", () => {

                it("should add an element to an empty map", () => {

                    const before: { [key: string]: number } = {};
                    const after = MapEventObservable.onAdded<number>(
                        before,
                        toSnapshot("1", 1),
                        toValue
                    );

                    expect(after).to.deep.equal({
                        "1": 1
                    });
                    expect(after).to.not.equal(before);
                });

                it("should add an element to a non-empty map", () => {

                    const before: { [key: string]: number } = {
                        "2": 2
                    };
                    const after = MapEventObservable.onAdded<number>(
                        before,
                        toSnapshot("1", 1),
                        toValue
                    );

                    expect(after).to.deep.equal({
                        "1": 1,
                        "2": 2
                    });
                    expect(after).to.not.equal(before);
                });
            });

            describe("onChanged", () => {

                it("should update an element", () => {

                    const before: { [key: string]: number } = {
                        "1": 1,
                        "2": 2
                    };
                    const after = MapEventObservable.onChanged<number>(
                        before,
                        toSnapshot("1", 1.1),
                        toValue
                    );

                    expect(after).to.deep.equal({
                        "1": 1.1,
                        "2": 2
                    });
                    expect(after).to.not.equal(before);
                });
            });

            describe("onRemoved", () => {

                it("should remove the element with the snapshot's key", () => {

                    const before: { [key: string]: number } = {
                        "1": 1,
                        "2": 2
                    };
                    const after = MapEventObservable.onRemoved<number>(
                        before,
                        toSnapshot("2", 2)
                    );

                    expect(after).to.deep.equal({
                        "1": 1
                    });
                    expect(after).to.not.equal(before);
                });
            });
        });
    });
});
