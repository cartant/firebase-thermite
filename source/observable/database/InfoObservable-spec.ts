/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import * as firebase from "firebase/app";
import "firebase/database";

import { expect } from "chai";
import { firebaseUserEmail, firebaseUserPassword, timeout } from "../../constants-spec";
import { app } from "../../firebase-spec";
import { InfoObservable } from "./InfoObservable";

import "rxjs/add/operator/filter";
import "rxjs/add/operator/first";
import "rxjs/add/operator/toPromise";

describe("observable/database", function (): void {

    /*tslint:disable-next-line:no-invalid-this */
    this.timeout(timeout);

    describe("InfoObservable", () => {

        afterEach(() => {

            return app.auth().signOut();
        });

        beforeEach(() => {

            return app.auth().signInWithEmailAndPassword(
                firebaseUserEmail,
                firebaseUserPassword
            );
        });

        it("should emit the system information", () => {

            const info = InfoObservable.create(app.database());
            return info
                .filter(value => value.connected)
                .first()
                .toPromise()
                .then((value) => {

                    expect(value).to.have.property("connected", true);
                    expect(value).to.have.property("serverTimeOffset");
                    expect(value).to.have.property("serverTime");
                    expect(value.serverTimeOffset).to.be.a("number");
                    expect(value.serverTime).to.be.a("date");
                });
        });
    });
});
