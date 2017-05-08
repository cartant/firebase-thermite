/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { Subject } from "rxjs/Subject";
import { ThermiteDatabase } from "./database";
import { firebase } from "../firebase";
import { app } from "../firebase-spec";

import "rxjs/add/operator/first";
import "rxjs/add/operator/toPromise";

describe("database", () => {

    let thermiteDatabase: ThermiteDatabase;

    beforeEach(() => {

        thermiteDatabase = new ThermiteDatabase(app);
    });

    describe("ThermiteDatabase", () => {

        describe("interface", () => {

            it("should implement infiniteList", () => {

                expect(thermiteDatabase).to.respondTo("infiniteList");
            });

            it("should implement info", () => {

                expect(thermiteDatabase).to.respondTo("info");
            });

            it("should implement key", () => {

                expect(thermiteDatabase).to.respondTo("key");
            });

            it("should implement list", () => {

                expect(thermiteDatabase).to.respondTo("list");
            });

            it("should implement map", () => {

                expect(thermiteDatabase).to.respondTo("map");
            });

            it("should implement query", () => {

                expect(thermiteDatabase).to.respondTo("map");
            });

            it("should implement ref", () => {

                expect(thermiteDatabase).to.respondTo("ref");
            });

            it("should implement value", () => {

                expect(thermiteDatabase).to.respondTo("value");
            });
        });

        describe("overloads", () => {

            describe("infiniteList", () => {

                let listRef: firebase.database.Reference;
                let notifier: Subject<any>;

                beforeEach(() => {

                    notifier = new Subject<any>();

                    listRef = app.database().ref("temp/list");
                    return listRef.update({
                        a: {
                            age: 42,
                            name: "alice"
                        },
                        b: {
                            age: 54,
                            name: "bob"
                        }
                    });
                });

                it("should be callable with a ref", () => {

                    const result = thermiteDatabase
                        .infiniteList(listRef, notifier)
                        .first()
                        .toPromise()
                        .then((list) => {

                            expect(list).to.deep.equal([{
                                $key: "a",
                                age: 42,
                                name: "alice"
                            }, {
                                $key: "b",
                                age: 54,
                                name: "bob"
                            }]);
                        });

                    notifier.next(true);
                    return result;
                });

                it("should be callable with a string", () => {

                    const result = thermiteDatabase
                        .infiniteList("temp/list", notifier)
                        .first()
                        .toPromise()
                        .then((list) => {

                            expect(list).to.deep.equal([{
                                $key: "a",
                                age: 42,
                                name: "alice"
                            }, {
                                $key: "b",
                                age: 54,
                                name: "bob"
                            }]);
                        });

                    notifier.next(true);
                    return result;
                });

                it("should be callable with a value selector", () => {

                    const result = thermiteDatabase
                        .infiniteList(
                            "temp/list",
                            notifier,
                            (snapshot) => ({
                                $key: snapshot.key as string,
                                name: snapshot.val().name
                            })
                        )
                        .first()
                        .toPromise()
                        .then((list) => {

                            expect(list).to.deep.equal([{
                                $key: "a",
                                name: "alice"
                            }, {
                                $key: "b",
                                name: "bob"
                            }]);
                        });

                    notifier.next(true);
                    return result;
                });

                it("should be callable with value and key selectors", () => {

                    const result = thermiteDatabase
                        .infiniteList(
                            "temp/list",
                            notifier,
                            (snapshot) => ({
                                id: snapshot.key as string,
                                name: snapshot.val().name
                            }),
                            (value) => value.id
                        )
                        .first()
                        .toPromise()
                        .then((list) => {

                            expect(list).to.deep.equal([{
                                id: "a",
                                name: "alice"
                            }, {
                                id: "b",
                                name: "bob"
                            }]);
                        });

                    notifier.next(true);
                    return result;
                });
            });

            describe("list", () => {

                let listRef: firebase.database.Reference;

                beforeEach(() => {

                    listRef = app.database().ref("temp/list");
                    return listRef.update({
                        a: {
                            age: 42,
                            name: "alice"
                        },
                        b: {
                            age: 54,
                            name: "bob"
                        }
                    });
                });

                it("should be callable with a ref", () => {

                    return thermiteDatabase
                        .list(listRef)
                        .first()
                        .toPromise()
                        .then((list) => {

                            expect(list).to.deep.equal([{
                                $key: "a",
                                age: 42,
                                name: "alice"
                            }, {
                                $key: "b",
                                age: 54,
                                name: "bob"
                            }]);
                        });
                });

                it("should be callable with a string", () => {

                    return thermiteDatabase
                        .list("temp/list")
                        .first()
                        .toPromise()
                        .then((list) => {

                            expect(list).to.deep.equal([{
                                $key: "a",
                                age: 42,
                                name: "alice"
                            }, {
                                $key: "b",
                                age: 54,
                                name: "bob"
                            }]);
                        });
                });

                it("should be callable with a value selector", () => {

                    return thermiteDatabase
                        .list(
                            "temp/list",
                            (snapshot) => ({
                                $key: snapshot.key as string,
                                name: snapshot.val().name
                            })
                        )
                        .first()
                        .toPromise()
                        .then((list) => {

                            expect(list).to.deep.equal([{
                                $key: "a",
                                name: "alice"
                            }, {
                                $key: "b",
                                name: "bob"
                            }]);
                        });
                });

                it("should be callable with value and key selectors", () => {

                    return thermiteDatabase
                        .list(
                            "temp/list",
                            (snapshot) => ({
                                id: snapshot.key as string,
                                name: snapshot.val().name
                            }),
                            (value) => value.id
                        )
                        .first()
                        .toPromise()
                        .then((list) => {

                            expect(list).to.deep.equal([{
                                id: "a",
                                name: "alice"
                            }, {
                                id: "b",
                                name: "bob"
                            }]);
                        });
                });
            });

            describe("map", () => {

                let mapRef: firebase.database.Reference;

                beforeEach(() => {

                    mapRef = app.database().ref("temp/map");
                    return mapRef.update({
                        a: {
                            age: 42,
                            name: "alice"
                        }
                    });
                });

                it("should be callable with a ref", () => {

                    return thermiteDatabase
                        .map(mapRef)
                        .first()
                        .toPromise()
                        .then((map) => {

                            expect(map).to.deep.equal({
                                a: {
                                    age: 42,
                                    name: "alice"
                                }
                            });
                        });
                });

                it("should be callable with a string", () => {

                    return thermiteDatabase
                        .map("temp/map")
                        .first()
                        .toPromise()
                        .then((map) => {

                            expect(map).to.deep.equal({
                                a: {
                                    age: 42,
                                    name: "alice"
                                }
                            });
                        });
                });

                it("should be callable with a value selector", () => {

                    return thermiteDatabase
                        .map("temp/map", (snapshot) => snapshot.val().name)
                        .first()
                        .toPromise()
                        .then((map) => {

                            expect(map).to.deep.equal({
                                a: "alice"
                            });
                        });
                });
            });

            describe("value", () => {

                let valueRef: firebase.database.Reference;

                beforeEach(() => {

                    valueRef = app.database().ref("temp/value");
                    return valueRef.update({
                        age: 42,
                        name: "alice"
                    });
                });

                it("should be callable with a ref", () => {

                    return thermiteDatabase
                        .value(valueRef)
                        .first()
                        .toPromise()
                        .then((value) => {

                            expect(value).to.deep.equal({
                                age: 42,
                                name: "alice"
                            });
                        });
                });

                it("should be callable with a string", () => {

                    return thermiteDatabase
                        .value("temp/value")
                        .first()
                        .toPromise()
                        .then((value) => {

                            expect(value).to.deep.equal({
                                age: 42,
                                name: "alice"
                            });
                        });
                });

                it("should be callable with a value selector", () => {

                    return thermiteDatabase
                        .value("temp/value", (snapshot) => snapshot.val().name)
                        .first()
                        .toPromise()
                        .then((value) => {

                            expect(value).to.equal("alice");
                        });
                });
            });
        });
    });
});
