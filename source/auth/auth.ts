/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-thermite
 */

import { Observable } from "rxjs/Observable";
import { Scheduler } from "rxjs/Scheduler";
import { firebase, FirebasePromise } from "../firebase";
import { AuthStateObservable } from "../observable/auth";
import { IdTokenObservable } from "../observable/auth";

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

    get idToken(): Observable<firebase.User> {

        return this.observeOn(IdTokenObservable.create(this.auth_));
    }

    get languageCode(): string | null {

        return this.auth_.languageCode;
    }

    applyActionCode(code: string): FirebasePromise<any> {

        return this.auth_.applyActionCode(code);
    }

    checkActionCode(code: string): FirebasePromise<any> {

        return this.auth_.checkActionCode(code);
    }

    confirmPasswordReset(code: string, password: string): FirebasePromise<any> {

        return this.auth_.confirmPasswordReset(code, password);
    }

    createUserWithEmailAndPassword(email: string, password: string): FirebasePromise<any> {

        return this.auth_.createUserWithEmailAndPassword(email, password);
    }

    fetchProvidersForEmail(email: string): FirebasePromise<any> {

        return this.auth_.fetchProvidersForEmail(email);
    }

    getRedirectResult(): FirebasePromise<any> {

        return this.auth_.getRedirectResult();
    }

    onAuthStateChanged(
        nextOrObserver: firebase.Observer<any, any> | ((user: firebase.User | null) => any),
        error?: (error: firebase.auth.Error) => any,
        completed?: () => any
    ): () => any {

        return this.auth_.onAuthStateChanged(nextOrObserver, error, completed);
    }

    onIdTokenChanged(
        nextOrObserver: firebase.Observer<any, any> | ((user: firebase.User | null) => any),
        error?: (error: firebase.auth.Error) => any,
        completed?: () => any
    ): () => any {

        return this.auth_.onIdTokenChanged(nextOrObserver, error, completed);
    }

    sendPasswordResetEmail(email: string): FirebasePromise<any> {

        return this.auth_.sendPasswordResetEmail(email);
    }

    setPersistence(persistence: firebase.auth.Auth.Persistence): FirebasePromise<any> {

        return this.auth_.setPersistence(persistence);
    }

    signInAndRetrieveDataWithCredential(credential: firebase.auth.AuthCredential): FirebasePromise<any> {

        return this.auth_.signInAndRetrieveDataWithCredential(credential);
    }

    signInAnonymously(): FirebasePromise<any> {

        return this.auth_.signInAnonymously();
    }

    signInWithCredential(credential: firebase.auth.AuthCredential): FirebasePromise<any> {

        return this.auth_.signInWithCredential(credential);
    }

    signInWithCustomToken(token: string): FirebasePromise<any> {

        return this.auth_.signInWithCustomToken(token);
    }

    signInWithEmailAndPassword(email: string, password: string): FirebasePromise<any> {

        return this.auth_.signInWithEmailAndPassword(email, password);
    }

    signInWithPhoneNumber(
        phoneNumber: string,
        applicationVerifier: firebase.auth.ApplicationVerifier
    ): FirebasePromise<any> {

        return this.auth_.signInWithPhoneNumber(phoneNumber, applicationVerifier);
    }

    signInWithPopup(provider: firebase.auth.AuthProvider): FirebasePromise<any> {

        return this.auth_.signInWithPopup(provider);
    }

    signInWithRedirect(provider: firebase.auth.AuthProvider): FirebasePromise<any> {

        return this.auth_.signInWithRedirect(provider);
    }

    signOut(): FirebasePromise<any> {

        return this.auth_.signOut();
    }

    useDeviceLanguage(): any {

        return this.auth_.useDeviceLanguage();
    }

    verifyPasswordResetCode(code: string): FirebasePromise<any> {

        return this.auth_.verifyPasswordResetCode(code);
    }

    private observeOn<T>(observable: Observable<T>): Observable<T> {

        return this.scheduler ? observable.observeOn(this.scheduler) : observable;
    }
}
