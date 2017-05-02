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
import { Reference } from "../../database/types";
import { app } from "../../firebase-spec";
import { ListEventObservable } from "./ListEventObservable";

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

        describe("reducers", () => {

            interface Child {
                $key: string;
                value: number;
            }

            function toChild(snapshot: any): any {

                return snapshot.child;
            }

            function toSnapshot(child: Child): any {

                return { child, key: child.$key };
            }

            describe("onAdded", () => {

                it("should add an element with a null prevKey to an empty list", () => {

                    const before: Child[] = [];
                    const after = ListEventObservable.onAdded<Child>(
                        before,
                        toSnapshot({ $key: "1", value: 1 }),
                        toChild,
                        (element) => element.$key,
                        null
                    );

                    expect(after).to.deep.equal([
                        { $key: "1", value: 1 }
                    ]);
                    expect(after).to.not.equal(before);
                });

                it("should add an element with a non-null prevKey to an empty list", () => {

                    const before: Child[] = [];
                    const after = ListEventObservable.onAdded<Child>(
                        before,
                        toSnapshot({ $key: "1", value: 1 }),
                        toChild,
                        (element) => element.$key,
                        "2"
                    );

                    expect(after).to.deep.equal([
                        { $key: "1", value: 1 }
                    ]);
                    expect(after).to.not.equal(before);
                });

                it("should add an element with a null prevKey to a non-empty list", () => {

                    const before: Child[] = [
                        { $key: "2", value: 2 }
                    ];
                    const after = ListEventObservable.onAdded<Child>(
                        before,
                        toSnapshot({ $key: "1", value: 1 }),
                        toChild,
                        (element) => element.$key,
                        null
                    );

                    expect(after).to.deep.equal([
                        { $key: "1", value: 1 },
                        { $key: "2", value: 2 }
                    ]);
                    expect(after).to.not.equal(before);
                });

                it("should add an element with a non-null prevKey to a non-empty list", () => {

                    const before: Child[] = [
                        { $key: "2", value: 2 }
                    ];
                    const after = ListEventObservable.onAdded<Child>(
                        before,
                        toSnapshot({ $key: "1", value: 1 }),
                        toChild,
                        (element) => element.$key,
                        "2"
                    );

                    expect(after).to.deep.equal([
                        { $key: "2", value: 2 },
                        { $key: "1", value: 1 }
                    ]);
                    expect(after).to.not.equal(before);
                });
            });

            describe("onChanged", () => {

                it("should move an element with a null prevKey", () => {

                    const before: Child[] = [
                        { $key: "1", value: 1 },
                        { $key: "2", value: 2 },
                        { $key: "3", value: 3 }
                    ];
                    const after = ListEventObservable.onChanged<Child>(
                        before,
                        toSnapshot({ $key: "2", value: 2.1 }),
                        toChild,
                        (element) => element.$key,
                        null
                    );

                    expect(after).to.deep.equal([
                        { $key: "2", value: 2.1 },
                        { $key: "1", value: 1 },
                        { $key: "3", value: 3 }
                    ]);
                    expect(after).to.not.equal(before);
                });

                it("should move an element with a non-null prevKey", () => {

                    const before: Child[] = [
                        { $key: "1", value: 1 },
                        { $key: "2", value: 2 },
                        { $key: "3", value: 3 }
                    ];
                    const after = ListEventObservable.onChanged<Child>(
                        before,
                        toSnapshot({ $key: "3", value: 3.1 }),
                        toChild,
                        (element) => element.$key,
                        "1"
                    );

                    expect(after).to.deep.equal([
                        { $key: "1", value: 1 },
                        { $key: "3", value: 3.1 },
                        { $key: "2", value: 2 }
                    ]);
                    expect(after).to.not.equal(before);
                });

                it("should update elements with a null prevKey", () => {

                    const before: Child[] = [
                        { $key: "1", value: 1 },
                        { $key: "2", value: 2 },
                        { $key: "3", value: 3 }
                    ];
                    const after = ListEventObservable.onChanged<Child>(
                        before,
                        toSnapshot({ $key: "1", value: 1.1 }),
                        toChild,
                        (element) => element.$key,
                        null
                    );

                    expect(after).to.deep.equal([
                        { $key: "1", value: 1.1 },
                        { $key: "2", value: 2 },
                        { $key: "3", value: 3 }
                    ]);
                    expect(after).to.not.equal(before);
                });

                it("should update elements with a non-null prevKey", () => {

                    const before: Child[] = [
                        { $key: "1", value: 1 },
                        { $key: "2", value: 2 },
                        { $key: "3", value: 3 }
                    ];
                    const after = ListEventObservable.onChanged<Child>(
                        before,
                        toSnapshot({ $key: "2", value: 2.1 }),
                        toChild,
                        (element) => element.$key,
                        "1"
                    );

                    expect(after).to.deep.equal([
                        { $key: "1", value: 1 },
                        { $key: "2", value: 2.1 },
                        { $key: "3", value: 3 }
                    ]);
                    expect(after).to.not.equal(before);
                });
            });

            describe("onRemoved", () => {

                it("should remove the element with the snapshot's key", () => {

                    const before: Child[] = [
                        { $key: "1", value: 1 },
                        { $key: "2", value: 2 }
                    ];
                    const after = ListEventObservable.onRemoved<Child>(
                        before,
                        toSnapshot({ $key: "2", value: 2 }),
                        (element) => element.$key
                    );

                    expect(after).to.deep.equal([
                        { $key: "1", value: 1 }
                    ]);
                    expect(after).to.not.equal(before);
                });
            });
        });
    });
});
