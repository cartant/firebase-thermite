/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import * as firebase from "firebase";

export function asPromise(thenable: firebase.database.ThenableReference): Promise<firebase.database.Reference>;

export function asPromise<T>(promise: firebase.Promise<any>): Promise<T>;

export function asPromise<T>(thenable: firebase.Thenable<any>): Promise<T> {

    return thenable as any;
}
