/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Operator } from "rxjs/Operator";
import { Subscriber } from "rxjs/Subscriber";
import { Subscription, TeardownLogic } from "rxjs/Subscription";
import { firebase } from "../../firebase";

export class IdTokenObservable<T> extends Observable<T> {

    static create(auth: firebase.auth.Auth): IdTokenObservable<firebase.User> {

        return new IdTokenObservable((observer: Observer<firebase.User>) => {

            return auth.onIdTokenChanged(observer);
        });
    }

    constructor(subscribe?: (subscriber: Subscriber<T>) => TeardownLogic) {

        super(subscribe);
    }

    lift<R>(operator: Operator<T, R>): Observable<R> {

        const observable = new IdTokenObservable<R>();
        observable.operator = operator;
        observable.source = this;
        return observable;
    }
}
