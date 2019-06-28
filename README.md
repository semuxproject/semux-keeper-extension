# WIP: Semux Keeper Browser Extension

Semux Keeper is an extension that allows users to securely interact with Semux-enabled web services from the browser.

Private keys are encrypted and stored within the extension and cannot be accessed by online dApps and services, making sure that users' funds are protected from malicious websites.

## Build and run
1) Install dependencies via npm and bundle them with browserify
```
cd semux-keeper-extension
npm install
./node_modules/.bin/browserify js/semuxCalls.js -o js/bundle.js
```
2) In Chrome go to Settings -> Extensions (chrome://extensions/)
3) Enable Developer mode
4) Click "Load unpacked" and select project folder
