/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { Observable } from "rxjs/Observable";
import { Operator } from "rxjs/Operator";
import { Subscriber } from "rxjs/Subscriber";
import { Subscription, TeardownLogic } from "rxjs/Subscription";
import { DEFAULT_PAGE_SIZE } from "../../database/constants";
import { Keyed } from "../../database/keyed-value";
import { asRef } from "../../database/ref";
import { Query, Reference, Snapshot } from "../../database/types";
import { subscribeNonRealtime } from "./InfiniteListObservable-non-realtime";
import { subscribeRealtime } from "./InfiniteListObservable-realtime";
import { InfiniteListOptions } from "./InfiniteListObservable-types";

export { InfiniteListOptions };

export class InfiniteListObservable<T> extends Observable<T> {

    static create<T>(
        ref: Reference,
        notifier: Observable<any>,
        valueSelector: (snapshot: Snapshot) => T,
        keySelector: (value: T) => string, {
            pageSize = DEFAULT_PAGE_SIZE,
            query = { orderByKey: true },
            realtime = true,
            reverse = false
        }: InfiniteListOptions = {}
    ): InfiniteListObservable<T[]> {

        let initQueryKey: any;
        let queryKeySelector: (value: T) => any;

        if (query.orderByKey) {
            initQueryKey = reverse ? undefined : "";
            queryKeySelector = keySelector;
        } else if (query.orderByChild) {
            initQueryKey = reverse ? undefined : null;
            const child = query.orderByChild;
            queryKeySelector = (value: T) => ({ key: keySelector(value), value: value[child] });
        } else {
            throw new Error("Unexpected order (or no order) specified.");
        }

        let subscribe: (subscriber: Subscriber<T[]>) => TeardownLogic;
        if (realtime) {
            subscribe = subscribeRealtime(
                ref,
                notifier,
                valueSelector,
                keySelector,
                pageSize,
                query,
                initQueryKey,
                queryKeySelector,
                reverse
            );
        } else {
            subscribe = subscribeNonRealtime(
                ref,
                notifier,
                valueSelector,
                keySelector,
                pageSize,
                query,
                initQueryKey,
                queryKeySelector,
                reverse
            );
        }
        return new InfiniteListObservable(ref, subscribe);
    }

    constructor(
        private ref_: Reference,
        subscribe?: (subscriber: Subscriber<T>) => TeardownLogic
    ) {

        super(subscribe);
    }

    get query(): Query {

        return this.ref_;
    }

    get ref(): Reference {

        return asRef(this.ref_) as Reference;
    }

    lift<R>(operator: Operator<T, R>): Observable<R> {

        const observable = new InfiniteListObservable<R>(this.ref_);
        observable.operator = operator;
        observable.source = this;
        return observable;
    }
}
