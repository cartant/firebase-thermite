/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import * as firebase from "firebase/app";
import "firebase/messaging";

import { expect } from "chai";
import { app } from "../firebase-spec";
import { ThermiteMessaging } from "./messaging";

describe("messaging", () => {

    describe("ThermiteMessaging", () => {

        let thermiteMessaging: ThermiteMessaging;

        beforeEach(() => {

            thermiteMessaging = new ThermiteMessaging(app);
        });

        it("should implement onMessage", () => {

            expect(thermiteMessaging).to.respondTo("onMessage");
        });
    });
});
