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
import { MapObservable } from "./MapObservable";
import { Reference } from "../../database/types";
import { selectValue } from "../../database/value-with-key";

import "rxjs/add/operator/map";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";
import "rxjs/add/operator/toPromise";

describe("observable/database", function (): void {

    /*tslint:disable-next-line:no-invalid-this */
    this.timeout(timeout);

    describe("MapObservable", () => {

        let mapRef: Reference;

        beforeEach(() => {

            mapRef = app.database().ref("temp/entity");
            return mapRef.set({
                a: 1,
                b: 2,
                c: 3
            });
        });

        it("should emit the initial object", () => {

            return MapObservable.create(mapRef, selectValue)
                .take(1)
                .toPromise()
                .then((value) => {

                    expect(value).to.be.an("object");
                    expect(value).to.deep.equal({
                        a: 1,
                        b: 2,
                        c: 3
                    });
                    expectNoListeners(mapRef);
                });
        });

        it("should emit when properties are added", () => {

            return MapObservable.create(mapRef, selectValue)
                .map((value, index) => {

                    if (index === 0) {
                        Promise
                            .resolve()
                            .then(() => mapRef.child("d").set(4));
                    }
                    return value;
                })
                .skip(1)
                .take(1)
                .toPromise()
                .then((value) => {

                    expect(value).to.be.an("object");
                    expect(value).to.deep.equal({
                        a: 1,
                        b: 2,
                        c: 3,
                        d: 4
                    });
                    expectNoListeners(mapRef);
                });
        });

        it("should emit when properties are changed", () => {

            return MapObservable.create(mapRef, selectValue)
                .map((value, index) => {

                    if (index === 0) {
                        Promise
                            .resolve()
                            .then(() => mapRef.child("b").set(0));
                    }
                    return value;
                })
                .skip(1)
                .take(1)
                .toPromise()
                .then((value) => {

                    expect(value).to.be.an("object");
                    expect(value).to.deep.equal({
                        a: 1,
                        b: 0,
                        c: 3
                    });
                    expectNoListeners(mapRef);
                });
        });

        it("should emit when properties are removed", () => {

            return MapObservable.create(mapRef, selectValue)
                .map((value, index) => {

                    if (index === 0) {
                        Promise
                            .resolve()
                            .then(() => mapRef.child("b").remove());
                    }
                    return value;
                })
                .skip(1)
                .take(1)
                .toPromise()
                .then((value) => {

                    expect(value).to.be.an("object");
                    expect(value).to.deep.equal({
                        a: 1,
                        c: 3
                    });
                    expectNoListeners(mapRef);
                });
        });

        it("should support lift", () => {

            const lifted = MapObservable.create(mapRef, selectValue).map(Boolean);
            expect(lifted).to.be.an.instanceof(MapObservable);
            expect(lifted).to.have.property("query");
            expect(lifted).to.have.property("ref");
        });
    });
});
