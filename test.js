const Single = require('./index');

const controller = Single.create((e) => {
  e.onSuccess('Hello World');
}).doOnCancel(() => console.log('Cancelled')).delaySubscription(1000).subscribe(console.log, console.log);
