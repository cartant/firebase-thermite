/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { ListValue } from "./list-value";
import { isPrimitive, Snapshot, Value } from "./types";

export function selectListValue(snapshot: Snapshot): ListValue {

    const val = snapshot.val();
    let listValue = ((val === undefined) || (val === null)) ? { $value: null } : val;
    if (isPrimitive(listValue)) {
        listValue = { $value: listValue };
    }
    listValue.$key = snapshot.ref.key;
    return listValue;
}

export function selectValue(snapshot: Snapshot): Value | null {

    return snapshot.val();
}
