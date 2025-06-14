// ==UserScript==
// @name         灰机wiki加载器
// @namespace    http://tampermonkey.net/
// @version      2025-06-13
// @description  try to take over the world!
// @author       You
// @match        http*://pf2.huijiwiki.com/index.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=huijiwiki.com
// @run-at       document-end
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';
    const script = document.createElement('script');
    script.src = `http://127.0.0.1:14001/InteractiveMap.js?v=${Date.now()}`;
    script.onload = function() {
        console.log('InteractiveMap script loaded successfully.');
        script.remove(); // Remove the script element after loading
    };
    document.head.appendChild(script);
})();