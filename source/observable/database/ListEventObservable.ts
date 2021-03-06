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

export interface ListEvent {
    list: Snapshot[] | null;
    prevKey: string | null;
    snapshot: Snapshot | null;
    type: "added" | "changed" | "loaded" | "removed";
}

export interface ListEventOptions {
    added?: boolean;
    changed?: boolean;
    loaded?: boolean;
    removed?: boolean;
}

export class ListEventObservable<T> extends Observable<T> {

    static create(
        query: Query,
        events: ListEventOptions = { added: true, changed: true, loaded: true, removed: true }
    ): ListEventObservable<ListEvent> {

        return new ListEventObservable(query, (observer: Observer<ListEvent>) => {

            const unlisteners: {
                [type: string]: () => void
            } = {};

            const { added, changed, loaded, removed } = events;
            let hasLoaded: boolean = !loaded;
            let lastLoadedKey: string;
            let onlyLoaded = !(added || changed || removed);
            let snapshots: Snapshot[] = [];

            const errorListener = (error: Error) => {

                observer.error(error);
            };

            const elementSelector = (snapshot: Snapshot) => snapshot;
            const elementKeySelector = (snapshot: Snapshot) => snapshot.key as string;

            if (loaded) {

                const valueListener = (snapshot: Snapshot) => {

                    if (snapshot.exists()) {
                        snapshot.forEach((child) => {
                            lastLoadedKey = child.key as string;
                            return false;
                        });
                        hasLoaded = Boolean(snapshots.find((child) => child.key === lastLoadedKey));
                    } else {
                        hasLoaded = true;
                    }
                    if (hasLoaded) {
                        observer.next({
                            list: snapshots,
                            prevKey: null,
                            snapshot: null,
                            type: "loaded"
                        });
                        if (onlyLoaded) {
                            observer.complete();
                        }
                        snapshots = [];
                    }
                };
                query.once("value", valueListener, errorListener);
            }

            if (added || loaded) {

                const addedListener = (snapshot: Snapshot | null, prevKey?: string) => {

                    if (snapshot === null) {
                        observer.error(nullSnapshotError());
                        return;
                    }

                    if (hasLoaded) {
                        if (added) {
                            observer.next({
                                list: null,
                                prevKey: prevKey || null,
                                snapshot,
                                type: "added"
                            });
                        } else {
                            unlisteners["child_added"]();
                            delete unlisteners["child_added"];
                        }
                    } else {
                        snapshots = ListEventObservable.onAdded(
                            snapshots,
                            snapshot,
                            elementSelector,
                            elementKeySelector,
                            prevKey || null
                        );
                        if (snapshot.key === lastLoadedKey) {
                            hasLoaded = true;
                            observer.next({
                                list: snapshots,
                                prevKey: null,
                                snapshot: null,
                                type: "loaded"
                            });
                            if (onlyLoaded) {
                                observer.complete();
                            }
                            snapshots = [];
                        }
                    }
                };
                query.on("child_added", addedListener, errorListener);
                // https://github.com/firebase/firebase-js-sdk/issues/291
                unlisteners["child_added"] = () => query.off("child_added", addedListener as any);
            }

            if (changed || loaded) {

                const changedListener = (snapshot: Snapshot | null, prevKey?: string) => {

                    if (snapshot === null) {
                        observer.error(nullSnapshotError());
                        return;
                    }

                    if (hasLoaded) {
                        if (changed) {
                            observer.next({
                                list: null,
                                prevKey: prevKey || null,
                                snapshot,
                                type: "changed"
                            });
                        } else {
                            unlisteners["child_changed"]();
                            delete unlisteners["child_changed"];
                        }
                    } else {
                        snapshots = ListEventObservable.onChanged(
                            snapshots,
                            snapshot,
                            elementSelector,
                            elementKeySelector,
                            prevKey || null
                        );
                    }
                };
                query.on("child_changed", changedListener, errorListener);
                // https://github.com/firebase/firebase-js-sdk/issues/291
                unlisteners["child_changed"] = () => query.off("child_changed", changedListener as any);
            }

            if (removed || loaded) {

                const removedListener = (snapshot: Snapshot | null) => {

                    if (snapshot === null) {
                        observer.error(nullSnapshotError());
                        return;
                    }

                    if (hasLoaded) {
                        if (removed) {
                            observer.next({
                                list: null,
                                prevKey: null,
                                snapshot,
                                type: "removed"
                            });
                        } else {
                            unlisteners["child_removed"]();
                            delete unlisteners["child_removed"];
                        }
                    } else {
                        snapshots = ListEventObservable.onRemoved(
                            snapshots,
                            snapshot,
                            elementKeySelector
                        );
                    }
                };
                query.on("child_removed", removedListener, errorListener);
                unlisteners["child_removed"] = () => query.off("child_removed", removedListener);
            }

            return () => Object.keys(unlisteners).forEach((type) => unlisteners[type]());
        });
    }

    static onAdded<T>(
        elements: T[],
        snapshot: Snapshot,
        elementSelector: (snapshot: Snapshot) => T,
        elementKeySelector: (e: T) => string,
        prevKey: string | null
    ): T[] {

        const added = elementSelector(snapshot);

        if (elements.length === 0) {
            return [added];
        }
        return elements.reduce((accumulator, element, index) => {

            if (!prevKey && (index === 0)) {
                accumulator.push(added);
            }
            accumulator.push(element);
            if (prevKey && (prevKey === elementKeySelector(element))) {
                accumulator.push(added);
            }
            return accumulator;

        }, [] as T[]);
    }

    static onChanged<T>(
        elements: T[],
        snapshot: Snapshot,
        elementSelector: (snapshot: Snapshot) => T,
        elementKeySelector: (e: T) => string,
        prevKey: string | null
    ): T[] {

        const changed = elementSelector(snapshot);
        const changedKey = snapshot.key;

        return elements.reduce((accumulator, element, index) => {

            const elementKey = elementKeySelector(element);
            if (!prevKey && (index === 0)) {
                accumulator.push(changed);
                if (elementKey !== changedKey) {
                    accumulator.push(element);
                }
            } else if (elementKey === prevKey) {
                accumulator.push(element);
                accumulator.push(changed);
            } else if (elementKey !== changedKey) {
                accumulator.push(element);
            }
            return accumulator;

        }, [] as T[]);
    }

    static onLoaded<T>(
        snapshots: Snapshot[],
        elementSelector: (snapshot: Snapshot) => T
    ): T[] {

        return snapshots.map(elementSelector);
    }

    static onRemoved<T>(
        elements: T[],
        snapshot: Snapshot,
        elementKeySelector: (e: T) => string
    ): T[] {

        const removedKey = snapshot.key;
        return elements.filter((element) => elementKeySelector(element) !== removedKey);
    }

    constructor(
        private query_: Query,
        subscribe?: (subscriber: Subscriber<T>) => TeardownLogic
    ) {

        super(subscribe);
    }

    get query(): Query {

        return this.query_;
    }

    get ref(): Reference {

        return asRef(this.query_) as Reference;
    }

    lift<R>(operator: Operator<T, R>): Observable<R> {

        const observable = new ListEventObservable<R>(this.query_);
        observable.operator = operator;
        observable.source = this;
        return observable;
    }
}

function nullSnapshotError(): Error {

    return new Error("Received null snapshot.");
}
