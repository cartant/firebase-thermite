/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { IdTokenObservable } from "./IdTokenObservable";
import { firebaseUserEmail, firebaseUserPassword, timeout } from "../../constants-spec";
import { firebase } from "../../firebase";
import { app } from "../../firebase-spec";

import "rxjs/add/operator/take";
import "rxjs/add/operator/toPromise";

describe("observable/auth", function (): void {

    /*tslint:disable-next-line:no-invalid-this */
    this.timeout(timeout);

    describe("IdTokenObservable", () => {

        afterEach(() => {

            return app.auth().signOut();
        });

        it("should emit null when not signed in", () => {

            return app.auth()
                .signOut()
                .then(() => {

                    return IdTokenObservable.create(app.auth())
                        .take(1)
                        .toPromise()
                        .then((user) => {

                            expect(user).to.be.null;
                        });
                });
        });

        it("should emit the user when signed in", () => {

            return app.auth()
                .signInWithEmailAndPassword(firebaseUserEmail, firebaseUserPassword)
                .then(() => {

                    return IdTokenObservable.create(app.auth())
                        .take(1)
                        .toPromise()
                        .then((user) => {

                            expect(user).to.be.an("object");
                            expect(user).to.have.property("email");
                            expect(user).to.have.property("uid");
                        });
                });
        });
    });
});
