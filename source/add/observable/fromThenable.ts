/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { Observable } from "rxjs/Observable";
import { fromThenable as staticFromThenable } from "../../observable/fromThenable";

Observable.fromThenable = staticFromThenable;

declare module "rxjs/Observable" {
  namespace Observable {
    export let fromThenable: typeof staticFromThenable;
  }
}
