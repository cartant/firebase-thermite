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
import { Keyed } from "../../database/keyed-value";
import { asRef } from "../../database/ref";
import { Query, Reference, Snapshot } from "../../database/types";
import { ListEventObservable } from "./ListEventObservable";

import "rxjs/add/operator/scan";

export class ListObservable<T> extends Observable<T> {

    static create<T extends Keyed>(
        query: Query,
        valueSelector: (snapshot: Snapshot) => T
    ): ListObservable<T[]> {

        const elementSelector = valueSelector;
        const elementKeySelector = (element: T) => element.$key;

        return new ListObservable(query, (observer: Observer<T[]>) => {

            return ListEventObservable
                .create(query)
                .scan((elements, event) => {

                    const { list, prevKey, snapshot, type } = event;
                    switch (type) {

                    case "added":
                        return ListEventObservable.onAdded<T>(elements, snapshot, elementSelector, elementKeySelector, prevKey);

                    case "changed":
                        return ListEventObservable.onChanged<T>(elements, snapshot, elementSelector, elementKeySelector, prevKey);

                    case "loaded":
                        return ListEventObservable.onLoaded<T>(list, elementSelector);

                    case "removed":
                        return ListEventObservable.onRemoved<T>(elements, snapshot, elementKeySelector);

                    default:
                        throw new Error(`Unexpected event '${type}'.`);
                    }

                }, [] as T[])
                .subscribe(observer);
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

        const observable = new ListObservable<R>(this.query_);
        observable.operator = operator;
        observable.source = this;
        return observable;
    }
}
