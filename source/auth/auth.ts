/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { Observable } from "rxjs/Observable";
import { Scheduler } from "rxjs/Scheduler";
import { firebase } from "../firebase";
import { AuthStateObservable } from "../observable/auth";

import "rxjs/add/operator/observeOn";

export class ThermiteAuth implements firebase.auth.Auth {

    private auth_: firebase.auth.Auth;

    constructor(
        private app_: firebase.app.App,
        public scheduler?: Scheduler
    ) {

        this.auth_ = app_.auth();
    }

    get app(): firebase.app.App {

        return this.app_;
    }

    get authState(): Observable<firebase.User> {

        return this.observeOn(AuthStateObservable.create(this.auth_));
    }

    get currentUser(): firebase.User | null {

        return this.auth_.currentUser;
    }

    applyActionCode(code: string): firebase.Promise<any> {

        return this.auth_.applyActionCode(code);
    }

    checkActionCode(code: string): firebase.Promise<any> {

        return this.auth_.checkActionCode(code);
    }

    confirmPasswordReset(code: string, password: string): firebase.Promise<any> {

        return this.auth_.confirmPasswordReset(code, password);
    }

    createCustomToken(uid: string, claims?: Object | null): string {

        return this.auth_.createCustomToken(uid, claims);
    }

    createUserWithEmailAndPassword(email: string, password: string): firebase.Promise<any> {

        return this.auth_.createUserWithEmailAndPassword(email, password);
    }

    fetchProvidersForEmail(email: string): firebase.Promise<any> {

        return this.auth_.fetchProvidersForEmail(email);
    }

    getRedirectResult(): firebase.Promise<any> {

        return this.auth_.getRedirectResult();
    }

    onAuthStateChanged(
        nextOrObserver: Object,
        error?: (error: firebase.auth.Error) => any,
        completed?: () => any
    ): () => any {

        return this.auth_.onAuthStateChanged(nextOrObserver, error, completed);
    }

    sendPasswordResetEmail(email: string): firebase.Promise<any> {

        return this.auth_.sendPasswordResetEmail(email);
    }

    signInAnonymously(): firebase.Promise<any> {

        return this.auth_.signInAnonymously();
    }

    signInWithCredential(credential: firebase.auth.AuthCredential): firebase.Promise<any> {

        return this.auth_.signInWithCredential(credential);
    }

    signInWithCustomToken(token: string): firebase.Promise<any> {

        return this.auth_.signInWithCustomToken(token);
    }

    signInWithEmailAndPassword(email: string, password: string): firebase.Promise<any> {

        return this.auth_.signInWithEmailAndPassword(email, password);
    }

    signInWithPopup(provider: firebase.auth.AuthProvider): firebase.Promise<any> {

        return this.auth_.signInWithPopup(provider);
    }

    signInWithRedirect(provider: firebase.auth.AuthProvider): firebase.Promise<any> {

        return this.auth_.signInWithRedirect(provider);
    }

    signOut(): firebase.Promise<any> {

        return this.auth_.signOut();
    }

    verifyIdToken(idToken: string): firebase.Promise<any> {

        return this.auth_.verifyIdToken(idToken);
    }

    verifyPasswordResetCode(code: string): firebase.Promise<any> {

        return this.auth_.verifyPasswordResetCode(code);
    }

    private observeOn<T>(observable: Observable<T>): Observable<T> {

        return this.scheduler ? observable.observeOn(this.scheduler) : observable;
    }
}
