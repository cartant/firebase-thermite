/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { ThermiteAuth } from "./auth";
import { firebase } from "../firebase";
import { app } from "../firebase-spec";

describe("auth", () => {

    let thermiteAuth: ThermiteAuth;

    beforeEach(() => {

        thermiteAuth = new ThermiteAuth(app);
    });

    describe("ThermiteAuth", () => {

        it("should expose authState", () => {

            expect(thermiteAuth).to.have.property("authState");
        });

        it("should implement onAuthStateChanged", () => {

            expect(thermiteAuth).to.respondTo("onAuthStateChanged");
        });
    });
});
