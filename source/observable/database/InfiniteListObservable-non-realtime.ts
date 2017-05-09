/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subject } from "rxjs/Subject";
import { Subscriber } from "rxjs/Subscriber";
import { TeardownLogic } from "rxjs/Subscription";
import { toQuery } from "../../database/ref";
import { Reference, Snapshot } from "../../database/types";
import { InfiniteListQuery, Page } from "./InfiniteListObservable-types";
import { ListObservable } from "./ListObservable";

import "rxjs/add/observable/defer";
import "rxjs/add/observable/zip";
import "rxjs/add/operator/concatMap";
import "rxjs/add/operator/first";
import "rxjs/add/operator/map";
import "rxjs/add/operator/scan";
import "rxjs/add/operator/share";
import "rxjs/add/operator/startWith";
import "rxjs/add/operator/takeUntil";

export function subscribeNonRealtime<T>(
    ref: Reference,
    notifier: Observable<any>,
    valueSelector: (snapshot: Snapshot) => T,
    keySelector: (value: T) => string,
    pageSize: number,
    query: InfiniteListQuery,
    initQueryKey: any,
    queryKeySelector: (value: T) => any,
    reverse: boolean
): (subscriber: Subscriber<T[]>) => TeardownLogic {

    return (observer: Observer<T[]>) => {

        // The pages observable has a circular subscription to itself via the
        // lastKeys observable, so a subject and a takeUntil is required to
        // clean things up.

        const unsubscribed = new Subject<any>();

        let lastKeys: Observable<any>;
        let pages: Observable<Page>;

        if (reverse) {

            pages = Observable
                .zip(notifier, Observable.defer(() => lastKeys))
                .concatMap(([unused, lastKey], index) => ListObservable
                    .create<T>(toQuery(ref, {
                        ...query,
                        endAt: lastKey,
                        limitToLast: lastKey ? (pageSize + 1) : pageSize
                    }), valueSelector, keySelector)
                    .map((elements) => {

                        const page = { elements, index, lastKey };
                        page.elements.reverse();
                        if (lastKey) {
                            page.elements.shift();
                        }
                        if (page.elements.length > 0) {
                            page.lastKey = queryKeySelector(page.elements[page.elements.length - 1]);
                        }
                        return page;
                    })
                    .first()
                )
                .takeUntil(unsubscribed)
                .share();

        } else {

            pages = Observable
                .zip(notifier, Observable.defer(() => lastKeys))
                .concatMap(([unused, lastKey], index) => ListObservable
                    .create<T>(toQuery(ref, {
                        ...query,
                        limitToFirst: lastKey ? (pageSize + 1) : pageSize,
                        startAt: lastKey
                    }), valueSelector, keySelector)
                    .map((elements) => {

                        const page = { elements, index, lastKey };
                        if (lastKey) {
                            page.elements.shift();
                        }
                        if (page.elements.length > 0) {
                            page.lastKey = queryKeySelector(page.elements[page.elements.length - 1]);
                        }
                        return page;
                    })
                    .first()
                )
                .takeUntil(unsubscribed)
                .share();
        }

        lastKeys = pages
            .map((page) => page.lastKey)
            .startWith(initQueryKey);

        const subscription = pages
            .scan((list, page) => list.concat(page.elements), [] as T[])
            .subscribe(observer);

        return () => {
            subscription.unsubscribe();
            unsubscribed.next();
        };
    };
}
