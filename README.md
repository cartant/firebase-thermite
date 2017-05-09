# firebase-thermite

[![NPM version](https://img.shields.io/npm/v/firebase-thermite.svg)](https://www.npmjs.com/package/firebase-thermite)
[![Build status](https://img.shields.io/travis/cartant/firebase-thermite.svg)](http://travis-ci.org/cartant/firebase-thermite)
[![dependency status](https://img.shields.io/david/cartant/firebase-thermite.svg)](https://david-dm.org/cartant/firebase-thermite)
[![devDependency Status](https://img.shields.io/david/dev/cartant/firebase-thermite.svg)](https://david-dm.org/cartant/firebase-thermite#info=devDependencies)
[![peerDependency Status](https://img.shields.io/david/peer/cartant/firebase-thermite.svg)](https://david-dm.org/cartant/firebase-thermite#info=peerDependencies)

### What is it?

`firebase-thermite` is a library of RxJS observables for Firebase.

### Why might I need it?

You might need it if you want to use RxJS observables and the official Angular library for Firebase - [AngularFire2](https://github.com/angular/angularfire2) - does not suit your requirements.

<a name="differences"></a>

### How does it differ from AngularFire2?

* It does not have a dependency on Angular.
* It has a type information-only dependency on `firebase`, so it can be used with `firebase` and with `firebase-admin`.
* Its database observables emit appropriately typed values - rather than values typed as `any`.
* Its database observables support value selectors.
* Its database list observables support key selectors.
* It includes database observables that emit `loaded`, `added`, `changed` and `removed` events.
* It does not implement mutation methods on database observables - use the `ref` itself, instead.
* It does not implement declarative queries that contain `Subject` components - use a `Subject` that emits a declarative query and use [`toQuery`](https://github.com/cartant/firebase-thermite/blob/master/source/database/ref.ts) and create an observable within a `switchMap`, instead.
* It includes converters for `Thenable` instances. (Although, these [will become redundant](https://github.com/ReactiveX/rxjs/pull/2505) in RxJS 5.4.)
* It includes infinite list and map database observables.
* The Angular modules are split into a separate library: [`firebase-thermite-ng`](https://github.com/cartant/firebase-thermite-ng)

## Usage

At the moment, the tests will have to serve as the usage documentation.