/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import * as firebase from "firebase/app";

import { Observable } from "rxjs/Observable";
import { IScheduler } from "rxjs/Scheduler";
import { fromPromise } from "rxjs/observable/fromPromise";

export function fromThenable(thenable: firebase.database.ThenableReference, scheduler?: IScheduler): Observable<firebase.database.Reference>;

export function fromThenable<T>(promise: firebase.Promise<any>, scheduler?: IScheduler): Observable<T>;

export function fromThenable<T>(thenable: firebase.Thenable<any>, scheduler?: IScheduler): Observable<T> {

    return fromPromise(thenable as any, scheduler);
}
