const Single = require('./index.js');

const single = Single.error('Hello').ambWith(Single.timer(100));
single.subscribe(
  console.log,
  console.log,
);
