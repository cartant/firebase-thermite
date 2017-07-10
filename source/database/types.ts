/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { firebase } from "../firebase";

export type PrimitiveValue = boolean | number | string;
export type CompositeValue = { [key: string]: PrimitiveValue | CompositeValue };
export type Value = PrimitiveValue | CompositeValue;

export type Query = firebase.database.Query;
export type Reference = firebase.database.Reference;
export type Snapshot = firebase.database.DataSnapshot;

export function isCompositeValue(value: Value): value is CompositeValue {

    return (value !== null) && (value !== undefined) && !isPrimitiveValue(value);
}

export function isPrimitiveValue(value: Value): value is PrimitiveValue {

    return (/boolean|number|string/).test(typeof value);
}
