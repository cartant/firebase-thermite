/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { isPrimitive, Snapshot, Value } from "./types";
import { ValueWithKey } from "./value-with-key";

export function selectValue(snapshot: Snapshot): Value | null {

    return snapshot.val();
}

export function selectValueWithKey(snapshot: Snapshot): ValueWithKey {

    const val = snapshot.val();
    let valueWithKey = ((val === undefined) || (val === null)) ? { $value: null } : val;
    if (isPrimitive(valueWithKey)) {
        valueWithKey = { $value: valueWithKey };
    }
    valueWithKey.$key = snapshot.ref.key;
    return valueWithKey;
}
