export function debounce(fun, delay, ...args) {
  let timer = null;
  let tmpfun = function() {
    let ctx = this;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function() {
      fun.apply(ctx, args);
    }, delay);
  };
  return tmpfun;
}
