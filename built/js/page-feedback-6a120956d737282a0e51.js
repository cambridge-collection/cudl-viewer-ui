(()=>{var e,t={9905:(e,t,n)=>{function o(){function e(){dataLayer.push(arguments)}window.dataLayer=window.dataLayer||[],e("js",new Date),e("config","G-89DQZCHV21")}n(8526),window.addEventListener("load",(function(){window.cookieconsent.initialise({revokeBtn:'<div class="cc-revoke"></div>',type:"opt-in",position:"top",theme:"classic",palette:{popup:{background:"#ccc",text:"#444"},button:{background:"#8c6",text:"#fff"}},content:{message:"This website uses cookies.",link:"Privacy Statement",href:"/help#cookies"},onInitialise:function(e){e==cookieconsent.status.allow&&o()},onStatusChange:function(e){this.hasConsented()&&o()}})}))},533:(e,t,n)=>{"use strict";n(9905);var o=n(9755),c=n.n(o),i=(n(9858),n(1629),n(7216));class a extends i.Z{}var r=n(7187);function s(){!function(e,t,n){let o;var c=new Date;c.setTime(c.getTime()+158112e5),o="; expires="+c.toGMTString(),document.cookie="cudlcookies=true"+o+"; path=/"}(),c()(".cookienotice").hide()}new(n.n(r)());var l=n(8583),u=n.n(l),d=n(3218),f=n.n(d);let h=0;function p(){let e;const t=document.getElementsByClassName("mySlides"),n=document.getElementsByClassName("dot");if(void 0!==t&&0!==t.length){for(e=0;e<t.length;e++)t[e].style.display="none";for(h++,h>t.length&&(h=1),e=0;e<n.length;e++)n[e].className=n[e].className.replace(" active","");t[h-1].style.display="block",n[h-1].className+=" active",setTimeout(p,5e3)}}n(3138),window.jQuery=c(),c()((()=>{(function(e=c()){let t=function(){let e=c()(document.body).data("context")||{};if(!f()(e))throw new Error(`Invalid context data: expected an object but found: ${e}`);return e}(),n=t.csrf&&t.csrf.token,o=t.csrf&&t.csrf.header;if(!n)throw new a("csrf.token missing from context");if(!o)throw new a("csrf.header missing from context");var i,r;e.ajaxPrefilter((i=n,r=o,function(e,t,n){e.crossDomain||["GET","OPTIONS"].includes(e.type)||(e.headers=u()({},e.headers,{[r]:i}))}))})(),c()((()=>{c()(".quick-search .search-placeholder").each(((e,t)=>{!function(e){var t=c()(e);if(!(t.is(".search-placeholder")&&t.closest(".quick-search").length>0))throw new a("The element passed to quickSearch() must be a .search-placeholder with an ancestor .quick-search");var n=t.closest(".quick-search").is(".quick-search-tagging"),o=c()('<div class="campl-column9"><div class="campl-control-group"><div class="campl-controls"><input placeholder="Keywords" class="campl-input-block-level" type="text" value="" name="keyword"></div>'+(n?recallSlider:"")+'</div></div><div class="campl-column2"><div class="campl-controls"><button type="submit" class="campl-btn campl-primary-cta">Submit</button></div></div>'),i=c()('<form action="/search/advanced/results" class="clearfix">').append(o),r=t.closest(".quick-search").data("collection-facet");r&&i.append(c()("<input>").attr({type:"hidden",name:"facetCollection",value:r})),i.replaceAll(e)}(t)}))})),function(e){for(var t="cudlcookies=",n=document.cookie.split(";"),o=0;o<n.length;o++){for(var c=n[o];" "==c.charAt(0);)c=c.substring(1,c.length);if(0===c.indexOf(t))return c.substring(12,c.length)}return null}()||c()(".cookienotice").show().on("click","button",(()=>(s(),!1))).on("click","a",(()=>(s(),!0))),p(),function(){function e(){return document.getElementById("myDropdown").classList.toggle("show"),!1}window.onclick=function(e){if(!e.target.matches(".dropbtn")){var t,n=document.getElementsByClassName("dropdown-content");for(t=0;t<n.length;t++){var o=n[t];o.classList.contains("show")&&o.classList.remove("show")}}},c()("#menuDropdownOpenButton").on("click",(function(){e()})).on("keyup",(function(t){13===t.which&&e()})),c()("#menuDropdownCloseButton").on("click",(function(){e()}))}()}))}},n={};function o(e){var c=n[e];if(void 0!==c)return c.exports;var i=n[e]={id:e,loaded:!1,exports:{}};return t[e].call(i.exports,i,i.exports,o),i.loaded=!0,i.exports}o.m=t,e=[],o.O=(t,n,c,i)=>{if(!n){var a=1/0;for(u=0;u<e.length;u++){for(var[n,c,i]=e[u],r=!0,s=0;s<n.length;s++)(!1&i||a>=i)&&Object.keys(o.O).every((e=>o.O[e](n[s])))?n.splice(s--,1):(r=!1,i<a&&(a=i));if(r){e.splice(u--,1);var l=c();void 0!==l&&(t=l)}}return t}i=i||0;for(var u=e.length;u>0&&e[u-1][2]>i;u--)e[u]=e[u-1];e[u]=[n,c,i]},o.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return o.d(t,{a:t}),t},o.d=(e,t)=>{for(var n in t)o.o(t,n)&&!o.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},o.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),o.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.nmd=e=>(e.paths=[],e.children||(e.children=[]),e),(()=>{var e={198:0};o.O.j=t=>0===e[t];var t=(t,n)=>{var c,i,[a,r,s]=n,l=0;if(a.some((t=>0!==e[t]))){for(c in r)o.o(r,c)&&(o.m[c]=r[c]);if(s)var u=s(o)}for(t&&t(n);l<a.length;l++)i=a[l],o.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return o.O(u)},n=self.webpackChunkcudl_viewer_ui=self.webpackChunkcudl_viewer_ui||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))})();var c=o.O(void 0,[592],(()=>o(533)));c=o.O(c)})();