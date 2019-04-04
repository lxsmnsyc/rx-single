# rx-single

JS Implementation of the Reactive Extensions (RxJava) [Single](http://reactivex.io/documentation/single.html)

[![NPM](https://nodei.co/npm/rx-single.png)](https://nodei.co/npm/rx-single/)

[![](https://data.jsdelivr.com/v1/package/npm/rx-single/badge)](https://www.jsdelivr.com/package/npm/rx-single)
[![HitCount](http://hits.dwyl.io/lxsmnsyc/rx-single.svg)](http://hits.dwyl.io/lxsmnsyc/rx-single)

| Platform | Build Status |
| --- | --- |
| Linux | [![Build Status](https://travis-ci.org/LXSMNSYC/rx-single.svg?branch=master)](https://travis-ci.org/LXSMNSYC/rx-single) |
| Windows | [![Build status](https://ci.appveyor.com/api/projects/status/mkjwe462uk80axx4?svg=true)](https://ci.appveyor.com/project/LXSMNSYC/rx-single) |


[![codecov](https://codecov.io/gh/LXSMNSYC/rx-single/branch/master/graph/badge.svg)](https://codecov.io/gh/LXSMNSYC/rx-single)
[![Known Vulnerabilities](https://snyk.io/test/github/LXSMNSYC/rx-single/badge.svg?targetFile=package.json)](https://snyk.io/test/github/LXSMNSYC/rx-single?targetFile=package.json)

## Install

NPM

```bash
npm i rx-single
```

CDN

* jsDelivr
```html
<script src="https://cdn.jsdelivr.net/npm/rx-single/dist/index.min.js"></script>
```

* unpkg
```html
<script src="https://unpkg.com/rx-single/dist/index.min.js"></script>
```

## Usage

### Loading the module

#### CommonJS

```js
const Single = require('rx-single');
```

Loading the CommonJS module provides the Single class.

#### Browser

Loading the JavaScript file for the rx-single provides the Single class

## Documentation

You can read the documentation at the [official doc site](https://lxsmnsyc.github.io/rx-single/)

## Build

Clone the repo first, then run the following to install the dependencies

```bash
npm install
```

To build the coverages, run the test suite, the docs, and the distributable modules:

```bash
npm run build
```

## Changelogs
* 0.8.0
  - Fixed fromCallable and fromPromise subscription overhead
* 0.7.0
  - Replaced operator bindings with operator reference + Function.call
* 0.6.0
  - Fixed some operators not guarding observers.
* 0.4.0
  - Null values are now guarded. Previously, only undefined values are guarded.
* 0.3.0
  - Disposable deprecated. Single now uses AbortController for representing state of disposition.
  - Renamed doOnDispose to doOnAbort
* 0.2.0
  - onError (both Observer and Emitter) now only accepts Error instances.
  - if no onError function is provided for the subscription, the error to be received is thrown instead.
  - Single.error now only accepts Error instances.
  - fixed error message for Single.amb
* 0.1.0
  - Release