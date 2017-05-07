/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { firebase } from "../firebase";
import { app } from "../firebase-spec";
import { ThermiteStorage } from "./storage";

describe("storage", () => {

    describe("ThermiteStorage", () => {

        let thermiteStorage: ThermiteStorage;

        beforeEach(() => {

            thermiteStorage = new ThermiteStorage(app);
        });

        it("should implement ref", () => {

            expect(thermiteStorage).to.respondTo("ref");
        });
    });
});
