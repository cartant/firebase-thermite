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
import { asRef } from "../../database/ref";
import { Query, Reference, Snapshot } from "../../database/types";
import { WithKey } from "../../database/value-with-key";

export class ValueObservable<T> extends Observable<T> {

    static create<T extends WithKey>(
        query: Query,
        valueSelector: (snapshot: Snapshot) => T
    ): ValueObservable<T> {

        return new ValueObservable(query, (observer: Observer<T>) => {

            const listener = query.on(
                "value",
                (snapshot: Snapshot) => observer.next(valueSelector(snapshot)),
                (error: Error) => observer.error(error)
            );
            return () => query.off("value", listener);
        });
    }

    constructor(
        private query_: Query,
        subscribe?: <R>(subscriber: Subscriber<R>) => TeardownLogic
    ) {

        super(subscribe);
    }

    get query(): Query {

        return this.query_;
    }

    get ref(): Reference {

        return asRef(this.query_);
    }

    lift<R>(operator: Operator<T, R>): Observable<R> {

        const observable = new ValueObservable<R>(this.query_);
        observable.operator = operator;
        observable.source = this;
        return observable;
    }
}
