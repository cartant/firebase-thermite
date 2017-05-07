/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { ThermiteApp } from "./app";
import { firebase } from "../firebase";
import { app } from "../firebase-spec";

describe("app", () => {

    let thermiteApp: ThermiteApp;

    beforeEach(() => {

        thermiteApp = new ThermiteApp(app);
    });

    describe("ThermiteApp", () => {

        it("should implement auth", () => {

            expect(thermiteApp).to.respondTo("delete");
        });

        it("should implement database", () => {

            expect(thermiteApp).to.respondTo("database");
        });

        it("should implement delete", () => {

            expect(thermiteApp).to.respondTo("delete");
        });

        it("should implement messaging", () => {

            expect(thermiteApp).to.respondTo("messaging");
        });

        it("should implement storage", () => {

            expect(thermiteApp).to.respondTo("storage");
        });
    });
});
