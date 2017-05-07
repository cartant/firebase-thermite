/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { isPrimitiveValue, PrimitiveValue, Value } from "./types";

export interface Keyed {
    readonly $key: string;
}

export interface KeyedPrimitiveValue<T extends PrimitiveValue | null> extends Keyed {
    readonly $value: T;
}

export interface KeyedCompositeValue extends Keyed {
    [key: string]: Value;
}

export type KeyedValue = KeyedPrimitiveValue<PrimitiveValue | null> | KeyedCompositeValue;

export function fromKeyedValue(keyedValue: KeyedValue): Value | null {

    if (isKeyedPrimitiveValue(keyedValue)) {
        return keyedValue.$value;
    }

    const { $key: key, ...kept } = keyedValue;
    return kept;
}

export function isKeyedPrimitiveValue(keyedValue: KeyedValue): keyedValue is KeyedPrimitiveValue<PrimitiveValue> {

    return keyedValue["$value"] !== undefined;
}

export function toKeyedValue(value: Value | null | undefined, key: string): KeyedValue {

    if ((value === undefined) || (value === null)) {
        return { $key: key, $value: null };
    }
    if (isPrimitiveValue(value)) {
        return { $key: key, $value: value };
    }
    return { ...value, $key: key };
}
