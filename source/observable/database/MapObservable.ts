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
import { MapEventObservable } from "./MapEventObservable";

import "rxjs/add/operator/scan";

export class MapObservable<T> extends Observable<T> {

    static create<T>(
        query: Query,
        valueSelector: (snapshot: Snapshot) => T
    ): MapObservable<{ [key: string]: T }> {

        const elementSelector = valueSelector;

        return new MapObservable(query, (observer: Observer<{ [key: string]: T }>) => {

            return MapEventObservable
                .create(query)
                .scan((properties, event) => {

                    const { map, snapshot, type } = event;
                    switch (type) {

                    case "added":
                        if (!snapshot) {
                            throw expectedSnapshotError();
                        }
                        return MapEventObservable.onAdded(properties, snapshot, elementSelector);

                    case "changed":
                        if (!snapshot) {
                            throw expectedSnapshotError();
                        }
                        return MapEventObservable.onChanged(properties, snapshot, elementSelector);

                    case "loaded":
                        if (!map) {
                            throw expectedMapError();
                        }
                        return MapEventObservable.onLoaded(map, elementSelector);

                    case "removed":
                        if (!snapshot) {
                            throw expectedSnapshotError();
                        }
                        return MapEventObservable.onRemoved(properties, snapshot);

                    default:
                        throw new Error(`Unexpected event '${type}'.`);
                    }

                }, {} as { [key: string]: T })
                .subscribe(observer);
        });
    }

    constructor(
        private query_: Query,
        subscribe?: <R>(subscriber: Subscriber<R>
    ) => TeardownLogic) {

        super(subscribe);
    }

    get query(): Query {

        return this.query_;
    }

    get ref(): Reference {

        return asRef(this.query_) as Reference;
    }

    lift<R>(operator: Operator<T, R>): Observable<R> {

        const observable = new MapObservable<R>(this.query_);
        observable.operator = operator;
        observable.source = this;
        return observable;
    }
}

function expectedMapError(): Error {

    return new Error("Expected an event with a map.");
}

function expectedSnapshotError(): Error {

    return new Error("Expected an event with a snapshot.");
}
