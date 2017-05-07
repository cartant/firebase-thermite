/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { timeout } from "./constants-spec";
import { firebase } from "./firebase";
import { app } from "./firebase-spec";
import { asPromise } from "./thenable";

describe("thenable", function (): void {

    let sequenceRef: firebase.database.Reference;

    /*tslint:disable-next-line:no-invalid-this */
    this.timeout(timeout);

    beforeEach(() => {

        sequenceRef = app.database().ref("temp/sequence");
        return sequenceRef.remove();
    });

    describe("asPromise", () => {

        it("should convert a Promise to an observable", () => {

            const firebasePromise: firebase.Promise<any> = sequenceRef.remove();
            const promise: Promise<void> = asPromise<void>(firebasePromise);
            return promise;
        });

        it("should convert a ThenableReference to an observable", () => {

            const thenable: firebase.database.ThenableReference = sequenceRef.push({ one: 1 });
            const promise: Promise<firebase.database.Reference> = asPromise(thenable);
            return promise;
        });
    });
});
