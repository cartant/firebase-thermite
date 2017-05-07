/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import * as firebase from "firebase";

import { Observable } from "rxjs/Observable";
import { Scheduler } from "rxjs/Scheduler";

import "rxjs/add/operator/observeOn";

export class ThermiteStorage implements firebase.storage.Storage {

    private storage_: firebase.storage.Storage;

    constructor(
        private app_: firebase.app.App,
        public scheduler?: Scheduler
    ) {

        this.storage_ = app_.storage();
    }

    get app(): firebase.app.App {

        return this.app_;
    }

    get maxOperationRetryTime(): number {

        return this.storage_.maxOperationRetryTime;
    }

    get maxUploadRetryTime(): number {

        return this.storage_.maxUploadRetryTime;
    }

    ref(path?: string): firebase.storage.Reference {

        return this.storage_.ref(path);
    }

    refFromURL(url: string): firebase.storage.Reference {

        return this.storage_.refFromURL(url);
    }

    setMaxOperationRetryTime(time: number): any {

        return this.storage_.setMaxOperationRetryTime(time);
    }

    setMaxUploadRetryTime(time: number): any {

        return this.storage_.setMaxUploadRetryTime(time);
    }

    private observeOn<T>(observable: Observable<T>): Observable<T> {

        return this.scheduler ? observable.observeOn(this.scheduler) : observable;
    }
}
