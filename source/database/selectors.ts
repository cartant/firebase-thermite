/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { KeyedValue, toKeyedValue } from "./keyed-value";
import { Snapshot, Value } from "./types";

export function selectKey(value: KeyedValue): string {

    return value.$key;
}

export function selectKeyedValue(snapshot: Snapshot): KeyedValue {

    return toKeyedValue(snapshot.val(), snapshot.key as string);
}

export function selectValue(snapshot: Snapshot): Value | null {

    return snapshot.val();
}
