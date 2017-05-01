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
import { ListObservable } from "./ListObservable";
import { Reference } from "../../database/types";
import { fromValueWithKey, selectValueWithKey, ValueWithKey } from "../../database/value-with-key";

import "rxjs/add/operator/map";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";
import "rxjs/add/operator/toPromise";

describe("observable/database", function (): void {

    /*tslint:disable-next-line:no-invalid-this */
    this.timeout(timeout);

    describe("ListObservable", () => {

        let listRef: Reference;

        beforeEach(() => {

            listRef = app.database().ref("temp/entity");
            return listRef.set({
                a: 1,
                b: 2,
                c: 3
            });
        });

        it("should emit the initial list", () => {

            return ListObservable.create(listRef, selectValueWithKey)
                .take(1)
                .toPromise()
                .then((list) => {

                    expect(list).to.be.an("array");
                    expect(list).to.have.length(3);
                    expect(toKeys(list)).to.deep.equal(["a", "b", "c"]);
                    expect(toValues(list)).to.deep.equal([1, 2, 3]);
                    expectNoListeners(listRef);
                });
        });

        it("should emit when elements are added", () => {

            return ListObservable.create(listRef, selectValueWithKey)
                .map((value, index) => {

                    if (index === 0) {
                        Promise
                            .resolve()
                            .then(() => listRef.child("d").set(4));
                    }
                    return value;
                })
                .skip(1)
                .take(1)
                .toPromise()
                .then((list) => {

                    expect(list).to.be.an("array");
                    expect(list).to.have.length(4);
                    expect(toKeys(list)).to.deep.equal(["a", "b", "c", "d"]);
                    expect(toValues(list)).to.deep.equal([1, 2, 3, 4]);
                    expectNoListeners(listRef);
                });
        });

        it("should emit when elements are changed", () => {

            return ListObservable.create(listRef, selectValueWithKey)
                .map((value, index) => {

                    if (index === 0) {
                        Promise
                            .resolve()
                            .then(() => listRef.child("b").set(0));
                    }
                    return value;
                })
                .skip(1)
                .take(1)
                .toPromise()
                .then((list) => {

                    expect(list).to.be.an("array");
                    expect(list).to.have.length(3);
                    expect(toKeys(list)).to.deep.equal(["a", "b", "c"]);
                    expect(toValues(list)).to.deep.equal([1, 0, 3]);
                    expectNoListeners(listRef);
                });
        });

        it("should emit when elements are removed", () => {

            return ListObservable.create(listRef, selectValueWithKey)
                .map((value, index) => {

                    if (index === 0) {
                        Promise
                            .resolve()
                            .then(() => listRef.child("b").remove());
                    }
                    return value;
                })
                .skip(1)
                .take(1)
                .toPromise()
                .then((list) => {

                    expect(list).to.be.an("array");
                    expect(list).to.have.length(2);
                    expect(toKeys(list)).to.deep.equal(["a", "c"]);
                    expect(toValues(list)).to.deep.equal([1, 3]);
                    expectNoListeners(listRef);
                });
        });

        it("should support lift", () => {

            const lifted = ListObservable.create(listRef, selectValueWithKey).map(Boolean);
            expect(lifted).to.be.an.instanceof(ListObservable);
            expect(lifted).to.have.property("query");
            expect(lifted).to.have.property("ref");
        });

        function toKeys(list: ValueWithKey[]): string[] {

            return list.map((element) => element.$key);
        }

        function toValues(list: ValueWithKey[]): any[] {

            return list.map(fromValueWithKey);
        }
    });
});
