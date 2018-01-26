const concat = (...sources) => (start, sink) => {
  if (start !== 0) return;
  const n = sources.length;
  if (n === 0) {
    sink(0, () => {});
    sink(2);
    return;
  }
  let i = 0;
  let sourceTalkback;
  const talkback = (t, d) => {
    if (t === 1 || t === 2) {
      sourceTalkback(t, d);
    }
  };
  (function next() {
    if (i === n) {
      sink(2);
      return;
    }
    sources[i](0, (t, d) => {
      if (t === 0) {
        sourceTalkback = d;
        if (i === 0) sink(0, talkback);
        else sourceTalkback(1);
      } else if (t === 1) {
        sink(1, d);
      } else if (t === 2) {
        i++;
        next();
      }
    });
  })();
};

module.exports = concat;
