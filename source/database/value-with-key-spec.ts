/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import * as firebase from "firebase/app";
import "firebase/database";

import { expect } from "chai";
import { Snapshot, Value } from "./types";
import { fromValueWithKey, ValueWithKey } from "./value-with-key";

describe("database", () => {

    describe("value-with-key", () => {

        describe("fromValueWithKey", () => {

            it("should convert to primitive values", () => {

                let value = fromValueWithKey({ $key: "attending", $value: true });
                expect(value).to.equal(true);

                value = fromValueWithKey({ $key: "age", $value: 42 });
                expect(value).to.equal(42);

                value = fromValueWithKey({ $key: "name", $value: "alice" });
                expect(value).to.equal("alice");
            });

            it("should convert to object values", () => {

                let value = fromValueWithKey({
                    $key: "a",
                    age: 42,
                    name: "alice"
                });
                expect(value).to.deep.equal({
                    age: 42,
                    name: "alice"
                });
            });
        });
    });
});
