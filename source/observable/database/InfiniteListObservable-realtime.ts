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
import { ListEvent, ListEventObservable } from "./ListEventObservable";

import "rxjs/add/observable/defer";
import "rxjs/add/observable/merge";
import "rxjs/add/observable/zip";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/scan";
import "rxjs/add/operator/share";
import "rxjs/add/operator/startWith";
import "rxjs/add/operator/takeUntil";
import "rxjs/add/operator/takeWhile";

export function subscribeRealtime<T>(
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

        const elementSelector = valueSelector;
        const elementKeySelector = keySelector;
        const elementsSelector = (snapshots: Snapshot[]) => snapshots.map(elementSelector);

        const baseQuery = toQuery(ref, query);
        const changes = ListEventObservable
            .create(baseQuery, { changed: true })
            .map((event) => ({ event, index: -1, page: null }));
        const removes = ListEventObservable
            .create(baseQuery, { removed: true })
            .map((event) => ({ event, index: -1, page: null }));

        let lastKeys: Observable<any>;
        let pages: Observable<{ event: ListEvent, index: number, page: Page }>;

        if (reverse) {

            pages = Observable
                .zip(notifier, Observable.defer(() => lastKeys))
                .mergeMap(([unused, lastKey], index) => {

                    let pageQuery = toQuery(ref, {
                        ...query,
                        endAt: lastKey,
                        limitToLast: lastKey ? (pageSize + 1) : pageSize
                    });

                    return ListEventObservable
                        .create(pageQuery, { added: true, loaded: true })
                        .scan((accumulator, event) => {

                            let page: Page;
                            if (event.type === "loaded") {
                                if (!event.list) {
                                    throw expectedListError();
                                }
                                page = { elements: elementsSelector(event.list), index, lastKey };
                                page.elements.reverse();
                                if (lastKey) {
                                    page.elements.shift();
                                }
                                if (page.elements.length > 0) {
                                    page.lastKey = queryKeySelector(page.elements[page.elements.length - 1]);
                                }
                            } else {
                                page = accumulator.page;
                            }
                            return { event, index, page };
                        }, {} as { event: ListEvent, index: number, page: Page })
                        .takeWhile(({ event, page }) => (event.type === "loaded") || (page.lastKey !== lastKey));
                })
                .takeUntil(unsubscribed)
                .share();

        } else {

            pages = Observable
                .zip(notifier, Observable.defer(() => lastKeys))
                .mergeMap(([unused, lastKey], index) => {

                    let pageQuery = toQuery(ref, {
                        ...query,
                        limitToFirst: lastKey ? (pageSize + 1) : pageSize,
                        startAt: lastKey
                    });

                    return ListEventObservable
                        .create(pageQuery, { added: true, loaded: true })
                        .scan((accumulator, event) => {

                            let page: Page;
                            if (event.type === "loaded") {
                                if (!event.list) {
                                    throw expectedListError();
                                }
                                page = { elements: elementsSelector(event.list), index, lastKey };
                                if (lastKey) {
                                    page.elements.shift();
                                }
                                if (page.elements.length > 0) {
                                    page.lastKey = queryKeySelector(page.elements[page.elements.length - 1]);
                                }
                            } else {
                                page = accumulator.page;
                            }
                            return { event, index, page };
                        }, {} as { event: ListEvent, index: number, page: Page })
                        .takeWhile(({ event, page }) => (event.type === "loaded") || (page.lastKey !== lastKey));
                })
                .takeUntil(unsubscribed)
                .share();
        }

        lastKeys = pages
            .filter(({ event }) => event.type === "loaded")
            .map(({ page }) => page.lastKey)
            .startWith(initQueryKey);

        const subscription = Observable
            .merge(pages, changes, removes)
            .scan((scanned, { event, index, page: eventPage }) => {

                const { snapshot: eventSnapshot } = event;

                switch (event.type) {

                case "added":
                    if (!eventPage) {
                        throw expecteexpectedPageError();
                    }
                    if (!eventSnapshot) {
                        throw expectedSnapshotError();
                    }
                    const prevFound = !Boolean(event.prevKey) || Boolean(eventPage.elements.find(
                        (element: any) => elementKeySelector(element) === event.prevKey
                    ));
                    const elementFound = Boolean(eventPage.elements.find(
                        (element: any) => elementKeySelector(element) === eventSnapshot.key
                    ));
                    if (!prevFound || elementFound || (event.prevKey === eventPage.lastKey)) {
                        scanned.modified = false;
                    } else {
                        eventPage.elements = ListEventObservable.onAdded(
                            eventPage.elements,
                            eventSnapshot,
                            elementSelector,
                            elementKeySelector,
                            event.prevKey
                        );
                        scanned.modified = true;
                    }
                    break;

                case "changed":
                    if (!eventSnapshot) {
                        throw expectedSnapshotError();
                    }
                    scanned.pages.forEach((page) => {
                        page.elements = ListEventObservable.onChanged(
                            page.elements,
                            eventSnapshot,
                            elementSelector,
                            elementKeySelector,
                            event.prevKey
                        );
                    });
                    scanned.modified = true;
                    break;

                case "loaded":
                    if (!eventPage) {
                        throw expecteexpectedPageError();
                    }
                    let eventPageIndex = 0;
                    scanned.pages.forEach((page) => {
                        if (page.index < index) {
                            ++eventPageIndex;
                        }
                    });
                    scanned.pages.splice(eventPageIndex, 0, eventPage);
                    scanned.modified = true;
                    break;

                case "removed":
                    if (!eventSnapshot) {
                        throw expectedSnapshotError();
                    }
                    scanned.pages.forEach((page) => {
                        page.elements = ListEventObservable.onRemoved(
                            page.elements,
                            eventSnapshot,
                            elementKeySelector
                        );
                    });
                    scanned.modified = true;
                    break;

                default:
                    throw new Error(`Unexpected event type (${event.type}).`);
                }
                return scanned;

            }, { pages: [], modified: true } as { pages: Page[], modified: boolean })
            .filter((scanned) => scanned.modified)
            .map((scanned) => scanned.pages.reduce((list, page) => list.concat(page.elements), [] as T[]))
            .subscribe(observer);

        return () => {
            subscription.unsubscribe();
            unsubscribed.next();
        };
    };
}

function expectedListError(): Error {

    return new Error("Expected an event with a list.");
}

function expecteexpectedPageError(): Error {

    return new Error("Expected an event with a page.");
}

function expectedSnapshotError(): Error {

    return new Error("Expected an event with a snapshot.");
}
