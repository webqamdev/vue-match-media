# Vue matchMedia

This fork is a port to Vue 3

> React to media query changes in your Vue 3 application (useful for adaptive design).

## Installation

```sh
npm install @webqam/vue-match-media
```

## Usage

```js
import { createApp } from 'vue';
import App from '@/App.vue';
import { createVueMatchMediaPlugin } from '@webqam/vue-match-media';

// Define breakpoints you want to react to
const breakpoints = {
  s: '48em',
  m: '50em',
  l: '62em',
  xl: '75em',
};

const VueMatchMediaPlugin = createVueMatchMediaPlugin(breakpoints);

// Load plugin
createApp(App).use(VueMatchMediaPlugin).mount('#app');
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
    name: 'DemoComponent',
  };
</script>
```

Using composition API
```html
<template>
  <div>
    <div v-if="matchMedia.s">
      This content is visible only on devices above 48em.
    </div>

    <div v-if="matchMedia.xl">
      This content is visible only on devices above 75em.
    </div>
    <div v-else>
      This content is visible only on devices under 75em.
    </div>
  </div>
</template>

<script>
  import { useMatchMedia } from '@webqam/vue-match-media';
  
  export default {
    name: 'DemoComponent',
    setup() {
      const matchMedia = useMatchMedia();
      
      return {
        matchMedia
      }
    }
  };
</script>
```

## Breakpoint syntax

```js
const breakpoints = {
  // @media (min-width: 1920px)
  fullHD: 1920,
  // @media (min-width: 48em)
  medium: '48em',
  // Object notation
  // @media (max-width: 768px)
  mobile: { maxWidth: 768 },
  // @media (orientation: landscape)
  landscape: { orientation: 'landscape' },
  // Multiple features
  // @media (min-width: 62em) and (min-resolution: 150dpi)
  highDPIDesktop: {
    minWidth: '62em',
    minResolution: '150dpi',
  },
  // @media (min-width: 768px) and (max-width: 992px)
  tablet: [768, 992],
  // SSR support
  // In order to use SSR, you must provide a default value
  // @media (min-width: 62em)
  // Defaults to true during SSR, will be updated on client side
  large: {
    breakpoint: '62em',
    defaultValue: true,
  },
  // Defaults to false during SSR, will be updated on client side
  portrait: {
    breakpoint: { orientation: 'portrait' },
    defaultValue: false,
  },
};
```

## Contributing

Please see [contributing guide](CONTRIBUTING.md).

## License

[MIT](LICENSE)

## TODO List

- [x] SSR support (set a default breakpoint)
- [ ] Add demo
