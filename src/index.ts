import Vue, { PluginObject, VueConstructor } from 'vue';

declare module 'vue/types/vue' {
  interface Vue {
    $matchMedia: Record<string, boolean>;
  }
}

function isNumberWithUnit(v: any): boolean {
  return typeof v === 'string' && !!v.match(/^\d+(?:r?em|px)$/);
}

function valueWithUnit(v: string | number): string {
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

function pascalToKebab(str: string): string {
  return str.replace(/[\w]([A-Z])/g, m => m[0] + '-' + m[1]).toLowerCase();
}

type BreakpointValue = string | number;
type Breakpoint =
  | BreakpointValue
  | Record<string, BreakpointValue>
  | [BreakpointValue, BreakpointValue];
type BreakpointMap = Record<string, Breakpoint>;
type BreakpointMapValue = Record<string, boolean>;

export interface VueMatchMediaPluginOptions {
  breakpoints?: BreakpointMap;
}

export default {
  install(
    Vue: VueConstructor,
    { breakpoints = {} }: VueMatchMediaPluginOptions = {}
  ): void {
    const keys: string[] = Object.keys(breakpoints);

    const computedBreakpoints: Record<string, string> = keys.reduce(
      (acc, k) => {
        let rules: Record<string, BreakpointValue> = {};

        if (
          typeof breakpoints[k] === 'number' ||
          isNumberWithUnit(breakpoints[k])
        ) {
          rules.minWidth = breakpoints[k] as BreakpointValue;
        } else if (
          breakpoints[k] instanceof Array &&
          (breakpoints[k] as BreakpointValue[]).length === 2
        ) {
          const [minWidth, maxWidth] = breakpoints[k] as BreakpointValue[];

          if (typeof minWidth === 'number' || isNumberWithUnit(minWidth)) {
            rules.minWidth = minWidth;
          }

          if (typeof maxWidth === 'number' || isNumberWithUnit(maxWidth)) {
            rules.maxWidth = maxWidth;
          }
        } else if (typeof breakpoints[k] === 'object') {
          rules = {
            ...rules,
            ...(breakpoints[k] as Record<string, BreakpointValue>),
          };
        }

        acc[k] = Object.keys(rules)
          .map(r => `(${pascalToKebab(r)}: ${valueWithUnit(rules[r])})`)
          .join(' and ');

        return acc;
      },
      {} as Record<string, string>
    );

    const matchmediaObservable = Vue.observable(
      keys.reduce((acc, k) => {
        const mq = window.matchMedia(computedBreakpoints[k]);

        // Using the deprecated addListener instead of addEventListener
        // due to the lack of support in Safari
        mq.addListener(e => {
          matchmediaObservable[k] = e.matches;
        });

        acc[k] = mq.matches;

        return acc;
      }, {} as BreakpointMapValue)
    );

    Vue.prototype.$matchMedia = matchmediaObservable;
  },
} as PluginObject<VueMatchMediaPluginOptions>;
