# Vue matchMedia

> React to media query changes in your Vue application (useful for adaptive design).

## Installation

```sh
npm install @webqam/vue-match-media
```

## Usage

```js
import Vue from "vue";
import VueMatchMedia from "@webqam/vue-match-media";

// Define breakpoints you want to react to
const breakpoints = {
  breakpoints: {
    s: "48em",
    m: "50em",
    l: "62em",
    xl: "75em"
  }
};

// Load plugin
Vue.use(VueMatchMedia, { breakpoints });
```

```html
<template>
  <div>
    <div v-if="$matchMedia.s">
      This content is visible only on devices above 48em.
    </div>

    <div v-if="$matchMedia.xl">
      This content is visible only on devices above 75em.
    </div>
    <div v-else>
      This content is visible only on devices under 75em.
    </div>
  </div>
</template>

<script>
  export default {
    name: "DemoComponent"
  };
</script>
```

## Breakpoint syntax

TBD

## TODO List

- [ ] SSR support (set a default breakpoint)
- [ ] Add demo
