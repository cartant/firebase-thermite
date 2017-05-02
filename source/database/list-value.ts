/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { isPrimitive, Primitive, Snapshot, Value } from "./types";

export interface WithKey {
    readonly $key: string;
}

export interface ListPrimitive extends WithKey {
    readonly $value: Primitive;
}

export interface ListComposite extends WithKey {
    [key: string]: Value;
}

export type ListValue = ListPrimitive | ListComposite;

export function fromListValue(listValue: ListValue): Value | null {

    if (isListPrimitive(listValue)) {
        return listValue.$value;
    }

    const { $key: key, ...kept } = listValue;
    return kept;
}

export function isListPrimitive(listValue: ListValue): listValue is ListPrimitive {

    return listValue["$value"] !== undefined;
}
