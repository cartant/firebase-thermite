/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { firebase } from "../firebase";
import { fromKeyedValue, KeyedValue, toKeyedValue } from "./keyed-value";
import { Value } from "./types";

describe("database", () => {

    describe("keyed-value", () => {

        describe("fromKeyedValue", () => {

            it("should convert to primitive values", () => {

                let value = fromKeyedValue({ $key: "attending", $value: true });
                expect(value).to.equal(true);

                value = fromKeyedValue({ $key: "age", $value: 42 });
                expect(value).to.equal(42);

                value = fromKeyedValue({ $key: "name", $value: "alice" });
                expect(value).to.equal("alice");
            });

            it("should convert to composite values", () => {

                const keyedValue = {
                    $key: "a",
                    age: 42,
                    name: "alice"
                };
                const value = fromKeyedValue(keyedValue);

                expect(value).to.deep.equal({
                    age: 42,
                    name: "alice"
                });
                expect(value).to.not.equal(keyedValue);
            });

            it("should convert to null values", () => {

                let value = fromKeyedValue({ $key: "name", $value: null });
                expect(value).to.be.null;
            });
        });

        describe("toKeyedValue", () => {

            it("should convert primitive values", () => {

                let keyedValue = toKeyedValue(true, "attending");
                expect(keyedValue).to.deep.equal({ $key: "attending", $value: true });

                keyedValue = toKeyedValue(42, "age");
                expect(keyedValue).to.deep.equal({ $key: "age", $value: 42 });

                keyedValue = toKeyedValue("alice", "name");
                expect(keyedValue).to.deep.equal({ $key: "name", $value: "alice" });
            });

            it("should convert composite values", () => {

                const value = {
                    age: 42,
                    name: "alice"
                };
                const keyedValue = toKeyedValue(value, "a");

                expect(keyedValue).to.deep.equal({
                    $key: "a",
                    age: 42,
                    name: "alice"
                });
                expect(keyedValue).to.not.equal(value);
            });

            it("should convert undefined values", () => {

                let keyedValue = toKeyedValue(undefined, "name");
                expect(keyedValue).to.deep.equal({ $key: "name", $value: null });
            });

            it("should convert null values", () => {

                let keyedValue = toKeyedValue(null, "name");
                expect(keyedValue).to.deep.equal({ $key: "name", $value: null });
            });
        });
    });
});
