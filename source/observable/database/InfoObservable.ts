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
import { Snapshot } from "../../database/types";
import { firebase } from "../../firebase";

export interface Info {
    readonly connected: boolean;
    readonly serverTime?: Date;
    readonly serverTimeOffset?: number;
}

class InfoValue implements Info {

    readonly connected: boolean;
    readonly serverTimeOffset: number;

    constructor(snapshot: Snapshot) {

        Object.assign(this, snapshot.val());
    }

    get serverTime(): Date | undefined {

        // http://stackoverflow.com/a/23173251/6680611

        const { serverTimeOffset } = this;
        return (serverTimeOffset === undefined) ? undefined : new Date(Date.now() + serverTimeOffset);
    }
}

export class InfoObservable<T> extends Observable<T> {

    static create(database: firebase.database.Database): InfoObservable<Info> {

        return new InfoObservable((observer: Observer<Info>) => {

            const ref = database.ref(".info");
            const listener = ref.on(
                "value",
                (snapshot: Snapshot | null) => observer.next(new InfoValue(snapshot!)),
                (error: Error) => observer.error(error)
            );

            // https://github.com/firebase/firebase-js-sdk/issues/291
            return () => ref.off("value", listener as any);
        });
    }

    constructor(subscribe?: (subscriber: Subscriber<T>) => TeardownLogic) {

        super(subscribe);
    }

    lift<R>(operator: Operator<T, R>): Observable<R> {

        const observable = new InfoObservable<R>();
        observable.operator = operator;
        observable.source = this;
        return observable;
    }
}
