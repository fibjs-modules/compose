# @fibjs/compose

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![appveyor build status][appveyor-image]][appveyor-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@fibjs/compose.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@fibjs/compose
[travis-image]: https://img.shields.io/travis/fibjs-modules/compose.svg?style=flat-square
[travis-url]: https://travis-ci.org/fibjs-modules/compose
[appveyor-image]: https://ci.appveyor.com/api/projects/status/hnsvto46bnirhx1v/branch/master?svg=true
[appveyor-url]: https://ci.appveyor.com/project/ngot/compose
[codecov-image]: https://img.shields.io/codecov/c/github/fibjs-modules/compose.svg?style=flat-square
[codecov-url]: https://codecov.io/github/fibjs-modules/compose?branch=master
[david-image]: https://img.shields.io/david/fibjs-modules/compose.svg?style=flat-square
[david-url]: https://david-dm.org/fibjs-modules/compose
[snyk-image]: https://snyk.io/test/npm/@fibjs/compose/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/@fibjs/compose
[download-image]: https://img.shields.io/npm/dm/@fibjs/compose.svg?style=flat-square
[download-url]: https://npmjs.org/package/@fibjs/compose

Compose middleware.

## Install

```bash
$ npm i @fibjs/compose --save
```

## Usage

```js
const compose = require('@fibjs/compose');

const middleware = [
  (ctx, next) => {
    next();
  },
  (ctx, next) => {
    next();
  },
];

const fn = compose(middleware);
const ctx = {
  num: 1,
};

fn(ctx)(ctx, (ctx) => {});

```

## Questions & Suggestions

Please open an issue [here](https://github.com/fibjs-modules/compose/issues).

## License

[MIT](LICENSE)