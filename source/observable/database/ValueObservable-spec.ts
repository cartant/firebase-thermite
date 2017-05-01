/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import * as firebase from "firebase/app";
import "firebase/database";

import { expect } from "chai";
import { timeout } from "../../constants-spec";
import { expectNoListeners } from "../../database/expect-spec";
import { app } from "../../firebase-spec";
import { Reference } from "../../database/types";
import { ValueObservable } from "./ValueObservable";
import { selectValueWithKey, ValueWithKey } from "../../database/value-with-key";

import "rxjs/add/operator/map";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";
import "rxjs/add/operator/toPromise";

describe("observable/database", function (): void {

    /*tslint:disable-next-line:no-invalid-this */
    this.timeout(timeout);

    describe("ValueObservable", () => {

        let compositeRef: Reference;
        let primitiveRef: Reference;

        /*tslint:disable-next-line:no-invalid-this */
        this.timeout(timeout);

        beforeEach(() => {

            compositeRef = app.database().ref("temp/composite");
            primitiveRef = app.database().ref("temp/primitive");

            return Promise.all([
                compositeRef.set({
                    a: 1,
                    b: 2,
                    c: 3
                }),
                primitiveRef.set("alice")
            ]);
        });

        describe("primitive", () => {

            it("should emit the initial value", () => {

                return ValueObservable.create(primitiveRef, selectValueWithKey)
                    .take(1)
                    .toPromise()
                    .then((value) => {

                        expect(value).to.be.an("object");
                        expect(value).to.have.property("$key", "primitive");
                        expect(value).to.have.property("$value", "alice");
                        expectNoListeners(primitiveRef);
                    });
            });

            it("should emit when properties are changed", () => {

                return ValueObservable.create(primitiveRef, selectValueWithKey)
                    .map((value, index) => {

                        if (index === 0) {
                            Promise
                                .resolve()
                                .then(() => primitiveRef.set("alison"));
                        }
                        return value;
                    })
                    .skip(1)
                    .take(1)
                    .toPromise()
                    .then((value) => {

                        expect(value).to.be.an("object");
                        expect(value).to.have.property("$key", "primitive");
                        expect(value).to.have.property("$value", "alison");
                        expectNoListeners(primitiveRef);
                    });
            });

            it("should emit the value is removed", () => {

                return ValueObservable.create(primitiveRef, selectValueWithKey)
                    .map((value, index) => {

                        if (index === 0) {
                            Promise
                                .resolve()
                                .then(() => primitiveRef.remove());
                        }
                        return value;
                    })
                    .skip(1)
                    .take(1)
                    .toPromise()
                    .then((value) => {

                        expect(value).to.be.an("object");
                        expect(value).to.have.property("$key", "primitive");
                        expect(value).to.have.property("$value", null);
                        expectNoListeners(primitiveRef);
                    });
            });
        });

        describe("composite", () => {

            it("should emit the initial value", () => {

                return ValueObservable.create(compositeRef, selectValueWithKey)
                    .take(1)
                    .toPromise()
                    .then((value) => {

                        expect(value).to.be.an("object");
                        expect(value).to.deep.equal({
                            $key: "composite",
                            a: 1,
                            b: 2,
                            c: 3
                        });
                        expectNoListeners(compositeRef);
                    });
            });

            it("should emit when children are added", () => {

                return ValueObservable.create(compositeRef, selectValueWithKey)
                    .map((value, index) => {

                        if (index === 0) {
                            Promise
                                .resolve()
                                .then(() => compositeRef.child("d").set(4));
                        }
                        return value;
                    })
                    .skip(1)
                    .take(1)
                    .toPromise()
                    .then((value) => {

                        expect(value).to.be.an("object");
                        expect(value).to.deep.equal({
                            $key: "composite",
                            a: 1,
                            b: 2,
                            c: 3,
                            d: 4
                        });
                        expectNoListeners(compositeRef);
                    });
            });

            it("should emit when children are changed", () => {

                return ValueObservable.create(compositeRef, selectValueWithKey)
                    .map((value, index) => {

                        if (index === 0) {
                            Promise
                                .resolve()
                                .then(() => compositeRef.child("b").set(0));
                        }
                        return value;
                    })
                    .skip(1)
                    .take(1)
                    .toPromise()
                    .then((value) => {

                        expect(value).to.be.an("object");
                        expect(value).to.deep.equal({
                            $key: "composite",
                            a: 1,
                            b: 0,
                            c: 3
                        });
                        expectNoListeners(compositeRef);
                    });
            });

            it("should emit when children are removed", () => {

                return ValueObservable.create(compositeRef, selectValueWithKey)
                    .map((value, index) => {

                        if (index === 0) {
                            Promise
                                .resolve()
                                .then(() => compositeRef.child("b").remove());
                        }
                        return value;
                    })
                    .skip(1)
                    .take(1)
                    .toPromise()
                    .then((value) => {

                        expect(value).to.be.an("object");
                        expect(value).to.deep.equal({
                            $key: "composite",
                            a: 1,
                            c: 3
                        });
                        expectNoListeners(compositeRef);
                    });
            });
        });

        it("should support lift", () => {

            const lifted = ValueObservable.create(primitiveRef, selectValueWithKey).map(Boolean);
            expect(lifted).to.be.an.instanceof(ValueObservable);
            expect(lifted).to.have.property("query");
            expect(lifted).to.have.property("ref");
        });
    });
});
