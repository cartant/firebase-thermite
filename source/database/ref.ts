/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import * as firebase from "firebase/app";
import "firebase/database";

import { PrimitiveValue, Query, Reference } from "./types";

export function asRef(ref: Query | Reference): Reference {

    return Boolean(ref) ? isRef(ref) ? ref : (ref as any).ref : ref;
}

export function isQuery(ref: Query | Reference): boolean {

    return Boolean(ref && typeof ref["set"] !== "function");
}

export function isRef(ref: Query | Reference): boolean {

    return Boolean(ref && typeof ref["set"] === "function");
}

export function toQuery(
    ref: Reference,
    options: QueryOptions = {}
): Query {

    const multiOrderMessage = "Multiple orderings specified.";
    let query: Query = ref;

    if (options) {

        if (options.orderByChild) {
            if (options.orderByKey || options.orderByPriority || options.orderByValue) {
                throw new Error(multiOrderMessage);
            }
            query = query.orderByChild(options.orderByChild);
        } else if (options.orderByKey) {
            if (options.orderByChild || options.orderByPriority || options.orderByValue) {
                throw new Error(multiOrderMessage);
            }
            query = query.orderByKey();
        } else if (options.orderByPriority) {
            if (options.orderByChild || options.orderByKey || options.orderByValue) {
                throw new Error(multiOrderMessage);
            }
            query = query.orderByPriority();
        } else if (options.orderByValue) {
            if (options.orderByChild || options.orderByKey || options.orderByPriority) {
                throw new Error(multiOrderMessage);
            }
            query = query.orderByValue();
        }

        if (options.equalTo !== undefined) {
            if (options.equalTo === null) {
                query = query.equalTo(null);
            } else if (typeof options.equalTo === "object") {
                query = query.equalTo(options.equalTo.value, options.equalTo.key);
            } else {
                query = query.equalTo(options.equalTo);
            }
        }

        if (options.startAt !== undefined) {
            if (options.startAt === null) {
                query = query.startAt(null);
            } else if (typeof options.startAt === "object") {
                query = query.startAt(options.startAt.value, options.startAt.key);
            } else {
                query = query.startAt(options.startAt);
            }
        }

        if (options.endAt !== undefined) {
            if (options.endAt === null) {
                query = query.endAt(null);
            } else if (typeof options.endAt === "object") {
                query = query.endAt(options.endAt.value, options.endAt.key);
            } else {
                query = query.endAt(options.endAt);
            }
        }

        if (options.limitToFirst !== undefined) {
            query = query.limitToFirst(options.limitToFirst);
        }
        if (options.limitToLast !== undefined) {
            query = query.limitToLast(options.limitToLast);
        }
    }
    return query;
}

export interface ValueKeyOption {
    key: string;
    value: PrimitiveValue;
}

export interface QueryOptions {
    orderByChild?: string;
    orderByKey?: boolean;
    orderByPriority?: boolean;
    orderByValue?: boolean;
    endAt?: null | PrimitiveValue | ValueKeyOption;
    equalTo?: null | PrimitiveValue | ValueKeyOption;
    limitToFirst?: number;
    limitToLast?: number;
    startAt?: null | PrimitiveValue | ValueKeyOption;
}
