import { registerSW } from 'virtual:pwa-register';
import 'virtual:windi.css';
import App from './App.svelte';
import './global.scss';

registerSW({ immediate: true });

const app = new App({
  target: document.getElementById('app'),
});

export default app;
