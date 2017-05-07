/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { KeyedValue, toKeyedValue } from "./keyed-value";
import { Snapshot, Value } from "./types";

export function selectKeyedValue(snapshot: Snapshot): KeyedValue {

    return toKeyedValue(snapshot.val(), snapshot.ref.key);
}

export function selectValue(snapshot: Snapshot): Value | null {

    return snapshot.val();
}
