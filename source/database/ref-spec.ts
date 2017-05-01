/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import * as firebase from "firebase/app";
import "firebase/database";

import { expect } from "chai";
import { app } from "../firebase-spec";
import { asRef, isQuery, isRef, toQuery } from "./ref";

describe("database", () => {

    describe("ref", () => {

        describe("asRef", () => {

            it("should support refs", () => {

                const ref = app.database().ref();
                const result = asRef(ref);
                expect(result).to.equal(ref);
                expect(isRef(result)).to.be.true;
            });

            it("should support queries", () => {

                const query = app.database().ref().limitToFirst(1);
                const result = asRef(query);
                expect(result).to.not.equal(query);
                expect(isRef(result)).to.be.true;
            });

            it("should support nulls", () => {

                expect(asRef(null)).to.equal(null);
                expect(asRef(undefined)).to.equal(undefined);
            });
        });

        describe("isQuery", () => {

            it("should detect refs", () => {

                expect(isQuery(
                    app.database().ref()
                )).to.be.false;
            });

            it("should detect queries", () => {

                expect(isQuery(
                    app.database().ref().limitToFirst(1)
                )).to.be.true;
            });

            it("should detect nulls", () => {

                expect(isQuery(null)).to.be.false;
                expect(isQuery(undefined)).to.be.false;
            });
        });

        describe("isRef", () => {

            it("should detect refs", () => {

                expect(isRef(
                    app.database().ref()
                )).to.be.true;
            });

            it("should detect queries", () => {

                expect(isRef(
                    app.database().ref().limitToFirst(1)
                )).to.be.false;
            });

            it("should detect nulls", () => {

                expect(isRef(null)).to.be.false;
                expect(isRef(undefined)).to.be.false;
            });
        });

        describe("toQuery", () => {

            it.skip("should be tested", () => {
            });
        });
    });
});
