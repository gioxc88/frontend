// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// PrimeVue core and themes
import PrimeVue from 'primevue/config';
import Lara from '@primeuix/themes/lara';

// PrimeVue services
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Menu from 'primevue/menu';
import Divider from 'primevue/divider';
import Toast from 'primevue/toast';
import Checkbox from 'primevue/checkbox';
import Slider from 'primevue/slider';
import Popover from 'primevue/popover';

// GridLayoutPlus
import { GridLayout, GridItem } from 'grid-layout-plus'

// Import our CSS - order matters, our theme overrides need to come after PrimeVue
import './assets/main.css';


// Create app instance
const app = createApp(App);

// Use PrimeVue with Lara theme and proper dark mode configuration
app.use(PrimeVue, {
  theme: {
    preset: Lara,
    options: {
      preset: 'light',
      colorScheme: 'indigo',
      prefix: 'p',
      darkModeSelector: '.dark-theme', // This tells PrimeVue to look for .dark-theme class
      cssLayer: false
    }
  },
  ripple: true
});

// Use services
app.use(createPinia());
app.use(router);
app.use(ToastService);
app.use(ConfirmationService);

// Register components
app.component('p-button', Button);
app.component('p-input-text', InputText);
app.component('p-dialog', Dialog);
app.component('p-menu', Menu);
app.component('p-divider', Divider);
app.component('p-toast', Toast);
app.component('p-checkbox', Checkbox);
app.component('p-slider', Slider);
app.component('p-popover', Popover);
app.component('GridLayout', GridLayout)
app.component('GridItem', GridItem)


// Tooltip directive
import Tooltip from 'primevue/tooltip';
app.directive('tooltip', Tooltip);

// Mount app
app.mount('#app');
