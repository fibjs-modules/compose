module.exports = function compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  return (context, next = () => { }) => {
    let index = -1;
    function dispatch(i) {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      let fn;
      if (i === middleware.length)
        fn = next;
      else
        fn = middleware[i];

      return typeof fn === 'function' ? fn(context, function next() {
        return dispatch(i + 1);
      }) : () => {};
    }
    return dispatch(0);
  };
};