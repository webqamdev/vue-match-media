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

export type BreakpointValue = string | number;
export type Breakpoint =
  | BreakpointValue
  | Record<string, BreakpointValue>
  | [BreakpointValue, BreakpointValue];

export interface BreakpointEntryObject {
  breakpoint: Breakpoint;
  defaultValue?: boolean;
}

export type BreakpointMap = Record<string, Breakpoint | BreakpointEntryObject>;
type BreakpointMapValue = Record<string, boolean>;

export interface VueMatchMediaPluginOptions {
  breakpoints?: BreakpointMap;
}

function populateRules(
  breakpoint: Breakpoint
): Record<string, BreakpointValue> {
  let rules: Record<string, BreakpointValue> = {};

  if (typeof breakpoint === 'number' || isNumberWithUnit(breakpoint)) {
    rules.minWidth = breakpoint as BreakpointValue;
  } else if (
    breakpoint instanceof Array &&
    (breakpoint as BreakpointValue[]).length === 2
  ) {
    const [minWidth, maxWidth] = breakpoint as BreakpointValue[];

    if (typeof minWidth === 'number' || isNumberWithUnit(minWidth)) {
      rules.minWidth = minWidth;
    }

    if (typeof maxWidth === 'number' || isNumberWithUnit(maxWidth)) {
      rules.maxWidth = maxWidth;
    }
  } else if (typeof breakpoint === 'object') {
    rules = {
      ...rules,
      ...(breakpoint as Record<string, BreakpointValue>),
    };
  }

  return rules;
}

export default {
  install(
    Vue: VueConstructor,
    { breakpoints = {} }: VueMatchMediaPluginOptions = {}
  ): void {
    const keys: string[] = Object.keys(breakpoints);

    const computedBreakpoints: Record<string, string> = keys.reduce(
      (acc, k) => {
        const rules: Record<string, BreakpointValue> = populateRules(
          (typeof breakpoints[k] === 'object' &&
            (breakpoints[k] as BreakpointEntryObject).breakpoint) ||
            (breakpoints[k] as Breakpoint)
        );

        acc[k] = Object.keys(rules)
          .map(r => `(${pascalToKebab(r)}: ${valueWithUnit(rules[r])})`)
          .join(' and ');

        return acc;
      },
      {} as Record<string, string>
    );

    const matchmediaObservable = Vue.observable(
      keys.reduce((acc, k) => {
        // SSR
        if (typeof window === 'undefined') {
          if (
            typeof (breakpoints[k] as BreakpointEntryObject).defaultValue ===
            'undefined'
          ) {
            throw new Error(
              `In order to use this plugin with SSR, you must provide a default value for every breakpoint (defaultValue is missing for breakpoint '${k}')`
            );
          }

          acc[k] =
            (breakpoints[k] as BreakpointEntryObject).defaultValue || false;
        }
        // Client
        else {
          const mq = window.matchMedia(computedBreakpoints[k]);

          // Using the deprecated addListener instead of addEventListener
          // due to the lack of support in Safari
          mq.addListener(e => {
            matchmediaObservable[k] = e.matches;
          });

          acc[k] = mq.matches;
        }

        return acc;
      }, {} as BreakpointMapValue)
    );

    Vue.prototype.$matchMedia = matchmediaObservable;
  },
} as PluginObject<VueMatchMediaPluginOptions>;
