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

export interface MapEvent {
    map?: { [key: string]: Snapshot };
    snapshot: Snapshot;
    type: "added" | "changed" | "loaded" | "removed";
}

export interface MapEventOptions {
    added?: boolean;
    changed?: boolean;
    loaded?: boolean;
    removed?: boolean;
}

export class MapEventObservable<T> extends Observable<T> {

    static create(
        query: Query,
        events: MapEventOptions = { added: true, changed: true, loaded: true, removed: true }
    ): MapEventObservable<MapEvent> {

        return new MapEventObservable(query, (observer: Observer<MapEvent>) => {

            const unlisteners: {
                [type: string]: () => void
            } = {};

            const { added, changed, loaded, removed } = events;
            let hasLoaded: boolean = !loaded;
            let lastLoadedKey: string;
            let onlyLoaded = !(added || changed || removed);
            let snapshots: { [key: string]: Snapshot } = {};

            const errorListener = (error: Error) => {

                observer.error(error);
            };

            const elementSelector = (snapshot: Snapshot) => snapshot;

            if (loaded) {

                const valueListener = (snapshot: Snapshot) => {

                    if (snapshot.exists()) {
                        snapshot.forEach((child) => {
                            lastLoadedKey = child.key;
                            return false;
                        });
                        hasLoaded = Boolean(snapshots[lastLoadedKey]);
                    } else {
                        hasLoaded = true;
                    }
                    if (hasLoaded) {
                        observer.next({
                            map: snapshots,
                            snapshot: null,
                            type: "loaded"
                        });
                        if (onlyLoaded) {
                            observer.complete();
                        }
                        snapshots = null;
                    }
                };
                query.once("value", valueListener, errorListener);
            }

            if (added || loaded) {

                const addedListener = (snapshot: Snapshot, prevKey?: string) => {

                    if (hasLoaded) {
                        if (added) {
                            observer.next({
                                map: null,
                                snapshot,
                                type: "added"
                            });
                        } else {
                            unlisteners["child_added"]();
                            delete unlisteners["child_added"];
                        }
                    } else {
                        snapshots = MapEventObservable.onAdded(snapshots, snapshot, elementSelector);
                        if (snapshot.key === lastLoadedKey) {
                            hasLoaded = true;
                            observer.next({
                                map: snapshots,
                                snapshot: null,
                                type: "loaded"
                            });
                            if (onlyLoaded) {
                                observer.complete();
                            }
                            snapshots = null;
                        }
                    }
                };
                query.on("child_added", addedListener, errorListener);
                unlisteners["child_added"] = () => query.off("child_added", addedListener);
            }

            if (changed || loaded) {

                const changedListener = (snapshot: Snapshot, prevKey?: string) => {

                    if (hasLoaded) {
                        if (changed) {
                            observer.next({
                                map: null,
                                snapshot,
                                type: "changed"
                            });
                        } else {
                            unlisteners["child_changed"]();
                            delete unlisteners["child_changed"];
                        }
                    } else {
                        snapshots = MapEventObservable.onChanged(snapshots, snapshot, elementSelector);
                    }
                };
                query.on("child_changed", changedListener, errorListener);
                unlisteners["child_changed"] = () => query.off("child_changed", changedListener);
            }

            if (removed || loaded) {

                const removedListener = (snapshot: Snapshot) => {

                    if (hasLoaded) {
                        if (removed) {
                            observer.next({
                                map: null,
                                snapshot,
                                type: "removed"
                            });
                        } else {
                            unlisteners["child_removed"]();
                            delete unlisteners["child_removed"];
                        }
                    } else {
                        snapshots = MapEventObservable.onRemoved(snapshots, snapshot);
                    }
                };
                query.on("child_removed", removedListener, errorListener);
                unlisteners["child_removed"] = () => query.off("child_removed", removedListener);
            }

            return () => Object.keys(unlisteners).forEach((type) => unlisteners[type]());
        });
    }

    static onAdded<T>(
        map: { [key: string]: T },
        snapshot: Snapshot,
        elementSelector: (snapshot: Snapshot) => T
    ): { [key: string]: T } {

        return { ...map, [snapshot.key]: elementSelector(snapshot) };
    }

    static onChanged<T>(
        map: { [key: string]: T },
        snapshot: Snapshot,
        elementSelector: (snapshot: Snapshot) => T
    ): { [key: string]: T } {

        return { ...map, [snapshot.key]: elementSelector(snapshot) };
    }

    static onLoaded<T>(
        snapshots: { [key: string]: Snapshot },
        elementSelector: (snapshot: Snapshot) => T
    ): { [key: string]: T } {

        return Object.keys(snapshots).reduce((map, key) => {
            const snapshot = snapshots[key];
            map[key] = elementSelector(snapshot);
            return map;
        }, {} as { [key: string]: T });
    }

    static onRemoved<T>(
        map: { [key: string]: T },
        snapshot: Snapshot
    ): { [key: string]: T } {

        const { [snapshot.key]: removed, ...kept } = map;
        return kept;
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

        const observable = new MapEventObservable<R>(this.query_);
        observable.operator = operator;
        observable.source = this;
        return observable;
    }
}
