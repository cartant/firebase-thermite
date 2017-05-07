/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import * as firebase from "firebase";

import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Operator } from "rxjs/Operator";
import { Subscriber } from "rxjs/Subscriber";
import { Subscription, TeardownLogic } from "rxjs/Subscription";

export class AuthStateObservable<T> extends Observable<T> {

    static create(auth: firebase.auth.Auth): AuthStateObservable<firebase.User> {

        return new AuthStateObservable((observer: Observer<firebase.User>) => {

            return auth.onAuthStateChanged(observer);
        });
    }

    constructor(subscribe?: <R>(subscriber: Subscriber<R>) => TeardownLogic) {

        super(subscribe);
    }

    lift<R>(operator: Operator<T, R>): Observable<R> {

        const observable = new AuthStateObservable<R>();
        observable.operator = operator;
        observable.source = this;
        return observable;
    }
}
