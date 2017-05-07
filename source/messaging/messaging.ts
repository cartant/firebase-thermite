/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { Observable } from "rxjs/Observable";
import { Scheduler } from "rxjs/Scheduler";
import { firebase } from "../firebase";

import "rxjs/add/operator/observeOn";

export class ThermiteMessaging implements firebase.messaging.Messaging {

    private messaging_: firebase.messaging.Messaging;

    constructor(
        private app_: firebase.app.App,
        public scheduler?: Scheduler
    ) {

        this.messaging_ = app_.messaging();
    }

    get app(): firebase.app.App {

        return this.app_;
    }

    deleteToken(token: string): firebase.Promise<any> | null {

        return this.messaging_.deleteToken(token);
    }

    getToken(): firebase.Promise<any> | null {

        return this.messaging_.getToken();
    }

    onMessage(nextOrObserver: Object): () => any {

        return this.messaging_.onMessage(nextOrObserver);
    }

    onTokenRefresh(nextOrObserver: Object): () => any {

        return this.messaging_.onTokenRefresh(nextOrObserver);
    }

    requestPermission(): firebase.Promise<any> | null {

        return this.messaging_.requestPermission();
    }

    setBackgroundMessageHandler(callback: (a: Object) => any): any {

        return this.messaging_.setBackgroundMessageHandler(callback);
    }

    useServiceWorker(registration: any): any {

        return this.messaging_.useServiceWorker(registration);
    }

    private observeOn<T>(observable: Observable<T>): Observable<T> {

        return this.scheduler ? observable.observeOn(this.scheduler) : observable;
    }
}
