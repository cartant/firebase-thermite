/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { Reference } from "./types";

export function expectNoListeners(ref: Reference): void {

    if (ref["stats_"]) {
        expect(ref["stats_"]().listeners).to.have.property("total", 0);
    }
}
