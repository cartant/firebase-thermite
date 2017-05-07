/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { ThermiteDatabase } from "./database";
import { firebase } from "../firebase";
import { app } from "../firebase-spec";

describe("database", () => {

    let thermiteDatabase: ThermiteDatabase;

    beforeEach(() => {

        thermiteDatabase = new ThermiteDatabase(app);
    });

    describe("ThermiteDatabase", () => {

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
});
