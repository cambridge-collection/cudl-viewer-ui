(()=>{var e,t={9905:(e,t,o)=>{function n(){function e(){dataLayer.push(arguments)}window.dataLayer=window.dataLayer||[],e("js",new Date),e("config","G-89DQZCHV21")}o(8526),window.addEventListener("load",(function(){window.cookieconsent.initialise({revokeBtn:'<div class="cc-revoke"></div>',type:"opt-in",position:"bottom",theme:"classic",palette:{popup:{background:"#151515",text:"#fcfcfc"},button:{background:"#fcfcfc",text:"#151515"}},content:{message:'<div class="cookie-text-container"><p class="cookie-head">This website uses cookies.</p><p>Cookies are little files that we save on your device to remember your preferences. We use <b>necessary</b> cookies to make our site work. We use <b>site usage measurement</b> cookies to analyse anonymised usage patterns, to make our websites better for you.</p></div>',link:"Privacy Statement",href:"/help#cookies"},onInitialise:function(e){e==cookieconsent.status.allow&&n()},onStatusChange:function(e){this.hasConsented()&&n()}})}))},8160:(e,t,o)=>{"use strict";var n=o(9755),c=o.n(n),i=(o(9905),o(9858),o(1629),o(7216));class a extends i.Z{}var s=o(7187);function r(){!function(e,t,o){let n;var c=new Date;c.setTime(c.getTime()+158112e5),n="; expires="+c.toGMTString(),document.cookie="cudlcookies=true"+n+"; path=/"}(),c()(".cookienotice").hide()}new(o.n(s)());let l=0;function u(){let e;const t=document.getElementsByClassName("mySlides"),o=document.getElementsByClassName("dot");if(void 0!==t&&0!==t.length){for(e=0;e<t.length;e++)t[e].style.display="none";for(l++,l>t.length&&(l=1),e=0;e<o.length;e++)o[e].className=o[e].className.replace(" active","");t[l-1].style.display="block",o[l-1].className+=" active",setTimeout(u,5e3)}}o(3138),window.jQuery=c(),c()((()=>{c()((()=>{c()(".quick-search .search-placeholder").each(((e,t)=>{!function(e){var t=c()(e);if(!(t.is(".search-placeholder")&&t.closest(".quick-search").length>0))throw new a("The element passed to quickSearch() must be a .search-placeholder with an ancestor .quick-search");var o=t.closest(".quick-search").is(".quick-search-tagging"),n=c()('<div class="campl-column9"><div class="campl-control-group"><div class="campl-controls"><input placeholder="Keywords" class="campl-input-block-level" type="text" value="" name="keyword"></div>'+(o?recallSlider:"")+'</div></div><div class="campl-column2"><div class="campl-controls"><button type="submit" class="campl-btn campl-primary-cta">Submit</button></div></div>'),i=c()('<form action="/search/advanced/results" class="clearfix">').append(n),s=t.closest(".quick-search").data("collection-facet");s&&i.append(c()("<input>").attr({type:"hidden",name:"facetCollection",value:s})),i.replaceAll(e)}(t)}))})),function(e){for(var t="cudlcookies=",o=document.cookie.split(";"),n=0;n<o.length;n++){for(var c=o[n];" "==c.charAt(0);)c=c.substring(1,c.length);if(0===c.indexOf(t))return c.substring(12,c.length)}return null}()||c()(".cookienotice").show().on("click","button",(()=>(r(),!1))).on("click","a",(()=>(r(),!0))),u(),function(){function e(){return document.getElementById("myDropdown").classList.toggle("show"),!1}window.onclick=function(e){if(!e.target.matches(".dropbtn")){var t,o=document.getElementsByClassName("dropdown-content");for(t=0;t<o.length;t++){var n=o[t];n.classList.contains("show")&&n.classList.remove("show")}}},c()("#menuDropdownOpenButton").on("click",(function(){e()})).on("keyup",(function(t){13===t.which&&e()})),c()("#menuDropdownCloseButton").on("click",(function(){e()}))}()}))}},o={};function n(e){var c=o[e];if(void 0!==c)return c.exports;var i=o[e]={exports:{}};return t[e].call(i.exports,i,i.exports,n),i.exports}n.m=t,e=[],n.O=(t,o,c,i)=>{if(!o){var a=1/0;for(u=0;u<e.length;u++){for(var[o,c,i]=e[u],s=!0,r=0;r<o.length;r++)(!1&i||a>=i)&&Object.keys(n.O).every((e=>n.O[e](o[r])))?o.splice(r--,1):(s=!1,i<a&&(a=i));if(s){e.splice(u--,1);var l=c();void 0!==l&&(t=l)}}return t}i=i||0;for(var u=e.length;u>0&&e[u-1][2]>i;u--)e[u]=e[u-1];e[u]=[o,c,i]},n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e={487:0};n.O.j=t=>0===e[t];var t=(t,o)=>{var c,i,[a,s,r]=o,l=0;if(a.some((t=>0!==e[t]))){for(c in s)n.o(s,c)&&(n.m[c]=s[c]);if(r)var u=r(n)}for(t&&t(o);l<a.length;l++)i=a[l],n.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return n.O(u)},o=self.webpackChunkcudl_viewer_ui=self.webpackChunkcudl_viewer_ui||[];o.forEach(t.bind(null,0)),o.push=t.bind(null,o.push.bind(o))})();var c=n.O(void 0,[592],(()=>n(8160)));c=n.O(c)})();