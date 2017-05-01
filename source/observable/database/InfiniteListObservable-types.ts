/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

export interface InfiniteListOptions {
    pageSize?: number;
    query?: InfiniteListQuery;
    realtime?: boolean;
    reverse?: boolean;
}

export interface InfiniteListQuery {
    orderByKey?: boolean;
    orderByChild?: string;
}

export interface Page {
    elements: any[];
    index: number;
    lastKey: string;
}
