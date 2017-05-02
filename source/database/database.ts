/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import * as firebase from "firebase/app";
import "firebase/database";

import { Observable } from "rxjs/Observable";
import { Scheduler } from "rxjs/Scheduler";

import {
    InfiniteListObservable,
    InfiniteListOptions,
    Info,
    InfoObservable,
    ListObservable,
    MapObservable,
    ValueObservable
} from "../observable/database";

import { ListValue, WithKey } from "./list-value";
import { QueryOptions, toQuery } from "./ref";
import { selectListValue, selectValue } from "./selectors";
import { Composite, Query, Reference, Snapshot, Value } from "./types";

import "rxjs/add/operator/observeOn";

export class ThermiteDatabase implements firebase.database.Database {

    private database_: firebase.database.Database;

    constructor(
        private app_: firebase.app.App,
        public scheduler?: Scheduler
    ) {

        this.database_ = this.app_.database();
    }

    get app(): firebase.app.App {

        return this.app_;
    }

    goOffline(): any {

        return this.database_.goOffline();
    }

    goOnline(): any {

        return this.database_.goOnline();
    }

    infiniteList(
        ref: string | Reference,
        notifier: Observable<any>,
        options?: InfiniteListOptions
    ): InfiniteListObservable<ListValue[]>;

    infiniteList<T extends WithKey>(
        ref: string | Reference,
        notifier: Observable<any>,
        valueSelector: (snapshot: Snapshot) => T,
        options?: InfiniteListOptions
    ): InfiniteListObservable<T[]>;

    infiniteList(
        ref: string | Reference,
        notifier: Observable<any>,
        valueSelector: (snapshot: Snapshot) => any = null,
        options: InfiniteListOptions = {}
    ): InfiniteListObservable<any> {

        if (typeof valueSelector === "object") {
            options = valueSelector;
            valueSelector = undefined;
        }

        return this.observeOn(InfiniteListObservable.create(
            (typeof ref === "string") ? this.ref(ref) : ref,
            notifier,
            (valueSelector as any) || (selectListValue as any),
            options
        )) as InfiniteListObservable<any>;
    }

    info(): InfoObservable<Info> {

        return this.observeOn(
            InfoObservable.create(this.database_)
        ) as InfoObservable<Info>;
    }

    key(): string {

        return this.database_.ref().push(null).key;
    }

    list(
        query: string | Query
    ): ListObservable<ListValue[]>;

    list<T extends WithKey>(
        query: string | Query,
        valueSelector: (snapshot: Snapshot) => T
    ): ListObservable<T[]>;

    list(
        query: string | Query,
        valueSelector: (snapshot: Snapshot) => any = null
    ): ListObservable<any> {

        return this.observeOn(ListObservable.create(
            (typeof query === "string") ? this.ref(query) : query,
            (valueSelector as any) || (selectListValue as any)
        )) as ListObservable<any>;
    }

    map(
        query: string | Query
    ): MapObservable<Composite>;

    map<T>(
        query: string | Query,
        valueSelector: (snapshot: Snapshot) => T
    ): MapObservable<{ [key: string]: T }>;

    map(
        query: string | Query,
        valueSelector: (snapshot: Snapshot) => any = null
    ): MapObservable<any> {

        return this.observeOn(MapObservable.create(
            (typeof query === "string") ? this.ref(query) : query,
            (valueSelector as any) || (selectValue as any)
        )) as MapObservable<any>;
    }

    query(ref: string | Reference, options: QueryOptions): Query {

        return toQuery((typeof ref === "string") ? this.ref(ref) : ref, options);
    }

    ref(path?: string): Reference {

        return (path === undefined) ? this.database_.ref() : this.database_.ref(path);
    }

    refFromURL(url: string): firebase.database.Reference {

        return this.database_.refFromURL(url);
    }

    value(
        query: string | Query
    ): ValueObservable<Value | null>;

    value<T>(
        query: string | Query,
        valueSelector: (snapshot: Snapshot) => T
    ): ValueObservable<T>;

    value(
        query: string | Query,
        valueSelector: (snapshot: Snapshot) => any = null
    ): ValueObservable<any> {

        return this.observeOn(ValueObservable.create(
            (typeof query === "string") ? this.ref(query) : query,
            (valueSelector as any) || (selectValue as any)
        )) as ValueObservable<any>;
    }

    private observeOn<T>(observable: Observable<T>): Observable<T> {

        return this.scheduler ? observable.observeOn(this.scheduler) : observable;
    }
}
