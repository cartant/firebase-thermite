/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { firebase, FirebasePromise } from "../firebase";

export class ThermiteApp implements firebase.app.App {

    constructor (private app_: firebase.app.App) {}

    get name(): string {

        return this.app_.name;
    }

    get options(): Object {

        return this.app_.options;
    }

    auth(): firebase.auth.Auth {

        return this.app_.auth();
    }

    database(): firebase.database.Database {

        return this.app_.database();
    }

    delete(): FirebasePromise<void> {

        return this.app_.delete();
    }

    messaging(): firebase.messaging.Messaging {

        return this.app_.messaging();
    }

    storage(): firebase.storage.Storage {

        return this.app_.storage();
    }
}
