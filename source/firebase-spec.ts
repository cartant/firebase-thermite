/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import * as firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";

import { Mock } from "firebase-nightlight";

import {
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseDatabaseUrl,
    firebaseStorageBucket,
    firebaseUserEmail,
    firebaseUserPassword
} from "./constants-spec";

const useMock = true;
// tslint:disable-next-line
console.log(`Using ${useMock ? "a " : "an un"}mocked Firebase app...`);

let app: firebase.app.App;
if (useMock) {
    const mock = new Mock({
        identities: [{
            email: firebaseUserEmail,
            password: firebaseUserPassword
        }]
    });
    app = mock.initializeApp({});
} else {
    app = firebase.initializeApp({
        apiKey: firebaseApiKey,
        authDomain: firebaseAuthDomain,
        databaseURL: firebaseDatabaseUrl,
        storageBucket: firebaseStorageBucket
    });
}

export { app };
