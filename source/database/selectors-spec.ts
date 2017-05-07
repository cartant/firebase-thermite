/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import * as firebase from "firebase/app";
import "firebase/database";

import { expect } from "chai";
import { KeyedValue } from "./keyed-value";
import { selectKeyedValue, selectValue } from "./selectors";
import { Snapshot, Value } from "./types";

describe("database", () => {

    describe("types", () => {

        function mockSnapshot(key: string, value: any): Snapshot {

            const anything: any = {
                ref: { key },
                val(): any { return value; }
            };
            return anything as Snapshot;
        }

        describe("selectKeyedValue", () => {

            it("should convert snapshots with primitive values", () => {

                let valueWithKey = selectKeyedValue(mockSnapshot("attending", true));
                expect(valueWithKey).to.have.property("$key", "attending");
                expect(valueWithKey).to.have.property("$value", true);

                valueWithKey = selectKeyedValue(mockSnapshot("age", 42));
                expect(valueWithKey).to.have.property("$key", "age");
                expect(valueWithKey).to.have.property("$value", 42);

                valueWithKey = selectKeyedValue(mockSnapshot("name", "alice"));
                expect(valueWithKey).to.have.property("$key", "name");
                expect(valueWithKey).to.have.property("$value", "alice");
            });

            it("should convert snapshots with object values", () => {

                let valueWithKey = selectKeyedValue(mockSnapshot("a", {
                    age: 42,
                    name: "alice"
                }));
                expect(valueWithKey).to.deep.equal({
                    $key: "a",
                    age: 42,
                    name: "alice"
                });
            });
        });

        describe("selectValue", () => {

            it("should convert snapshots with primitive values", () => {

                let value = selectValue(mockSnapshot("attending", true));
                expect(value).to.equal(true);

                value = selectValue(mockSnapshot("age", 42));
                expect(value).to.equal(42);

                value = selectValue(mockSnapshot("name", "alice"));
                expect(value).to.equal("alice");
            });

            it("should convert snapshots with object values", () => {

                let value = selectValue(mockSnapshot("a", {
                    age: 42,
                    name: "alice"
                }));
                expect(value).to.deep.equal({
                    age: 42,
                    name: "alice"
                });
            });
        });
    });
});
