/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { isPrimitive, Primitive, Snapshot, Value } from "./types";

export interface WithKey {
    readonly $key: string;
}

export interface PrimitiveWithKey extends WithKey {
    readonly $value: Primitive;
}

export interface CompositeWithKey extends WithKey {
    [key: string]: Value;
}

export type ValueWithKey = PrimitiveWithKey | CompositeWithKey;

export function fromValueWithKey(valueWithKey: ValueWithKey): Value {

    if (isPrimitiveWithKey(valueWithKey)) {
        return valueWithKey.$value;
    }

    const { $key: key, ...kept } = valueWithKey;
    return kept;
}

export function isPrimitiveWithKey(valueWithKey: ValueWithKey): valueWithKey is PrimitiveWithKey {

    return valueWithKey["$value"] !== undefined;
}
