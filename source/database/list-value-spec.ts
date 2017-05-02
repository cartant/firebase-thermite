/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import * as firebase from "firebase/app";
import "firebase/database";

import { expect } from "chai";
import { fromListValue, ListValue } from "./list-value";
import { Snapshot, Value } from "./types";

describe("database", () => {

    describe("list-value", () => {

        describe("fromListValue", () => {

            it("should convert to primitive values", () => {

                let value = fromListValue({ $key: "attending", $value: true });
                expect(value).to.equal(true);

                value = fromListValue({ $key: "age", $value: 42 });
                expect(value).to.equal(42);

                value = fromListValue({ $key: "name", $value: "alice" });
                expect(value).to.equal("alice");
            });

            it("should convert to object values", () => {

                let value = fromListValue({
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
