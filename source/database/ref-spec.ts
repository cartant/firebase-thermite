/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import * as firebase from "firebase";

import { expect } from "chai";
import { Mock } from "firebase-nightlight";
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

            let mockRef: firebase.database.Reference;

            beforeEach(() => {

                const mock = new Mock();
                const mockApp = mock.initializeApp({});
                mockRef = mockApp.database().ref();
            });

            it("should build an orderByChild query", () => {

                const query = toQuery(mockRef, {
                    orderByChild: "name"
                });
                expect(query["query_"]).to.have.property("orderByChild", "name");
            });

            it("should build an orderByKey query", () => {

                const query = toQuery(mockRef, {
                    orderByKey: true
                });
                expect(query["query_"]).to.have.property("orderByKey", true);
            });

            it("should build an orderByValue query", () => {

                const query = toQuery(mockRef, {
                    orderByValue: true
                });
                expect(query["query_"]).to.have.property("orderByValue", true);
            });

            it("should build an equalTo query", () => {

                const query = toQuery(mockRef, {
                    equalTo: "alice",
                    orderByChild: "name"
                });
                expect(query["query_"]).to.have.property("equalTo", "alice");
                expect(query["query_"]).to.have.property("orderByChild", "name");
            });

            it("should build a startAt query", () => {

                const query = toQuery(mockRef, {
                    orderByChild: "name",
                    startAt: "alice"
                });
                expect(query["query_"]).to.have.property("orderByChild", "name");
                expect(query["query_"]).to.have.property("startAt", "alice");
            });

            it("should build an endAt query", () => {

                const query = toQuery(mockRef, {
                    endAt: "bob",
                    orderByChild: "name"
                });
                expect(query["query_"]).to.have.property("endAt", "bob");
                expect(query["query_"]).to.have.property("orderByChild", "name");
            });

            it("should build a startAt/endAt query", () => {

                const query = toQuery(mockRef, {
                    endAt: "bob",
                    orderByChild: "name",
                    startAt: "alice"
                });
                expect(query["query_"]).to.have.property("endAt", "bob");
                expect(query["query_"]).to.have.property("orderByChild", "name");
                expect(query["query_"]).to.have.property("startAt", "alice");
            });

            it("should build a limitToFirst query", () => {

                const query = toQuery(mockRef, {
                    limitToFirst: 10,
                    orderByChild: "name"
                });
                expect(query["query_"]).to.have.property("limitToFirst", 10);
                expect(query["query_"]).to.have.property("orderByChild", "name");
            });

            it("should build a limitToLast query", () => {

                const query = toQuery(mockRef, {
                    limitToLast: 10,
                    orderByChild: "name"
                });
                expect(query["query_"]).to.have.property("limitToLast", 10);
                expect(query["query_"]).to.have.property("orderByChild", "name");
            });

            it("should throw an error if multiple orderings are specified", () => {

                expect(() => {
                    toQuery(mockRef, {
                        orderByChild: "name",
                        orderByKey: true
                    });
                }).to.throw(Error);
            });
        });
    });
});
