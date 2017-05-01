/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import * as firebase from "firebase/app";
import "firebase/database";

import { expect } from "chai";
import { Observable } from "rxjs/Observable";
import { timeout } from "../../constants-spec";
import { app } from "../../firebase-spec";

import "rxjs/add/operator/toPromise";
import "./fromThenable";

describe("add/observable", function (): void {

    let sequenceRef: firebase.database.Reference;

    /*tslint:disable-next-line:no-invalid-this */
    this.timeout(timeout);

    describe("fromThenable", () => {

        beforeEach(() => {

            sequenceRef = app.database().ref("temp/sequence");
            return sequenceRef.remove();
        });

        it("should convert a Promise to an observable", () => {

            const promise: firebase.Promise<any> = sequenceRef.remove();
            return Observable.fromThenable(promise)
                .toPromise();
        });

        it("should convert a ThenableReference to an observable", () => {

            const thenable: firebase.database.ThenableReference = sequenceRef.push({ one: 1 });
            return Observable.fromThenable(thenable)
                .toPromise()
                .then((result) => {

                    expect(result).to.exist;
                    expect(result.key).to.equal(thenable.key);
                    expect(result.toString()).to.equal(thenable.toString());
                });
        });
    });
});
