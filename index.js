/**
 *
 * @param v
 * @returns {boolean}
 */
function isNumberWithUnit(v) {
  return typeof v === 'string' && !!v.match(/^\d+(?:r?em|px)$/);
}

/**
 *
 * @param {String|Number} v
 * @returns {string}
 */
function valueWithUnit(v) {
  if (
    (typeof v === 'number' && !isNaN(v)) ||
    (typeof v === 'string' && v.match(/^\d+(?:\.\d+)?$/))
  ) {
    return `${v}px`;
  } else if (typeof v === 'string') {
    return v;
  }

  throw new TypeError('Unknown unit value.');
}

/**
 *
 * @param {string} str
 * @returns {string}
 */
function pascalToKebab(str) {
  return str.replace(/[\w]([A-Z])/g, m => m[0] + '-' + m[1]).toLowerCase();
}

export default {
  install(Vue, { breakpoints = {} } = {}) {
    const keys = Object.keys(breakpoints);

    const computedBreakpoints = keys.reduce((acc, k) => {
      const rules = {};

      if (
        typeof breakpoints[k] === 'number' ||
        isNumberWithUnit(breakpoints[k])
      ) {
        rules.minWidth = breakpoints[k];
      } else if (
        breakpoints[k] instanceof Array &&
        breakpoints[k].length === 2
      ) {
        [rules.minWidth, rules.maxWidth] = breakpoints[k];
      } else if (typeof breakpoints[k] === 'object') {
        Object.assign(rules, breakpoints[k]);
      }

      acc[k] = Object.keys(rules)
        .map(r => `(${pascalToKebab(r)}: ${valueWithUnit(rules[r])})`)
        .join(' and ');

      return acc;
    }, {});

    const matchmediaObservable = new Vue.observable(
      keys.reduce((acc, k) => {
        const mq = window.matchMedia(computedBreakpoints[k]);

        // Using the deprecated addListener instead of addEventListener
        // due to the lack of support in Safari
        mq.addListener(e => {
          matchmediaObservable[k] = e.matches;
        });

        acc[k] = mq.matches;

        return acc;
      }, {})
    );

    Vue.prototype.$matchMedia = matchmediaObservable;
  },
};
