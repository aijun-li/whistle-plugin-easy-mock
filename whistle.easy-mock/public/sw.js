if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(s[o])return;let t={};const d=e=>i(e,o),l={module:{uri:o},exports:t,require:d};s[o]=Promise.all(n.map((e=>l[e]||d(e)))).then((e=>(r(...e),t)))}}define(["./workbox-f279ae30"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index.960659bc.js",revision:null},{url:"assets/index.c559d7d1.css",revision:null},{url:"assets/vendor.438aa677.js",revision:null},{url:"assets/vendor.eb0567bd.css",revision:null},{url:"index.html",revision:"ac2ed35eeaa72766a664d21ed7724cef"},{url:"favicon.ico",revision:"ba44f340afba5bb1a07f14decc15dd04"},{url:"robots.txt",revision:"f77c87f977e0fcce05a6df46c885a129"},{url:"pwa-48x48.png",revision:"26f0858756e3cd52930caa0c784583d4"},{url:"pwa-96x96.png",revision:"14d0531333b642e7f4106538d2cf5bf4"},{url:"pwa-192x192.png",revision:"c6456e04a725946bf43002dbf28e1517"},{url:"pwa-512x512.png",revision:"ab7526020444019049a67d59e270c3f6"},{url:"manifest.webmanifest",revision:"d40d3256a53099fa17b8d0699044ee81"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
