# firebase-thermite

[![NPM version](https://img.shields.io/npm/v/firebase-thermite.svg)](https://www.npmjs.com/package/firebase-thermite)
[![Build status](https://img.shields.io/travis/cartant/firebase-thermite.svg)](http://travis-ci.org/cartant/firebase-thermite)
[![dependency status](https://img.shields.io/david/cartant/firebase-thermite.svg)](https://david-dm.org/cartant/firebase-thermite)
[![devDependency Status](https://img.shields.io/david/dev/cartant/firebase-thermite.svg)](https://david-dm.org/cartant/firebase-thermite#info=devDependencies)
[![peerDependency Status](https://img.shields.io/david/peer/cartant/firebase-thermite.svg)](https://david-dm.org/cartant/firebase-thermite#info=peerDependencies)

### What is it?

`firebase-thermite` is a library of RxJS observables for Firebase.

### Why might you need it?

You might need it if you want to use RxJS observables and the official Angular library for Firebase - [AngularFire2](https://github.com/angular/angularfire2) - does not suit your requirements.

<a name="differences"></a>

### How does it differ from AngularFire2?

* It does not have a dependency on Angular.
* It has a type information-only dependency on `firebase`, so it can be used with `firebase` and with `firebase-admin`. <sup>*</sup>
* Its database observables emit appropriately typed values - rather than values typed as `any`.
* Its database observables support value selectors.
* Its database list observables support key selectors.
* It includes database observables that emit `loaded`, `added`, `changed` and `removed` events.
* It does not implement mutation methods on database observables - use the `ref` itself, instead.
* It does not implement declarative queries that contain `Subject` components - use a `Subject` that emits a declarative query and use [`toQuery`](https://github.com/cartant/firebase-thermite/blob/master/source/database/ref.ts) and create an observable within a `switchMap`, instead.
* It includes an infinite list database observable.
* It includes a map database observable.
* The Angular modules are split into a separate library: [`firebase-thermite-ng`](https://github.com/cartant/firebase-thermite-ng)

<sup>*</sup> Actually, this is no longer the case. In recent releases, the typings in `firebase` and `firebase-admin` have diverged. And adding some preprocessing to account for the differences (similar to what's in [`firebase-nightlight`](https://github.com/cartant/firebase-nightlight)) is on my TODO list.

## Usage

At the moment, the tests will have to serve as the usage documentation.

## Testing

To run the tests, you will need to provide several environment variables via a `.env` file. See [`constants-spec.ts`](https://github.com/cartant/firebase-thermite/blob/master/source/constants-spec.ts) and [`env-cmd`](https://www.npmjs.com/package/env-cmd) - which is used to [include the environment variables in the bundle](https://github.com/cartant/firebase-thermite/blob/v1.0.1/package.json#L68).