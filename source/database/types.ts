/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import * as firebase from "firebase/app";
import "firebase/database";

export type Primitive = boolean | number | string;
export type Composite = { [key: string]: Primitive | Composite };
export type Value = Primitive | Composite;

export type Query = firebase.database.Query;
export type Reference = firebase.database.Reference;
export type Snapshot = firebase.database.DataSnapshot;

export function isPrimitive(value: Value): value is Primitive {

    return (/boolean|number|string/).test(typeof value);
}
