(()=>{var e,t={9905:(e,t,o)=>{function n(){function e(){dataLayer.push(arguments)}window.dataLayer=window.dataLayer||[],e("js",new Date),e("config","G-89DQZCHV21")}o(8526),window.addEventListener("load",(function(){window.cookieconsent.initialise({revokeBtn:'<div class="cc-revoke"></div>',type:"opt-in",position:"bottom",theme:"classic",palette:{popup:{background:"#151515",text:"#fcfcfc"},button:{background:"#fcfcfc",text:"#151515"}},content:{message:'<div class="cookie-text-container"><p class="cookie-head">This website uses cookies.</p><p>Cookies are little files that we save on your device to remember your preferences. We use <b>necessary</b> cookies to make our site work. We use <b>site usage measurement</b> cookies to analyse anonymised usage patterns, to make our websites better for you.</p></div>',link:"Privacy Statement",href:"/help#cookies"},onInitialise:function(e){e==cookieconsent.status.allow&&n()},onStatusChange:function(e){this.hasConsented()&&n()}})}))},483:(e,t,o)=>{"use strict";var n=o(9755),i=o.n(n),s=o(3279),a=o.n(s),c=(o(1629),o(9858),o(9905),o(7216));class r extends c.Z{}var l=o(7187);function u(){!function(e,t,o){let n;var i=new Date;i.setTime(i.getTime()+158112e5),n="; expires="+i.toGMTString(),document.cookie="cudlcookies=true"+n+"; path=/"}(),i()(".cookienotice").hide()}new(o.n(l)());let d=0;function p(){let e;const t=document.getElementsByClassName("mySlides"),o=document.getElementsByClassName("dot");if(void 0!==t&&0!==t.length){for(e=0;e<t.length;e++)t[e].style.display="none";for(d++,d>t.length&&(d=1),e=0;e<o.length;e++)o[e].className=o[e].className.replace(" active","");t[d-1].style.display="block",o[d-1].className+=" active",setTimeout(p,5e3)}}function h(){i()(window).width()>767?i()("span.hint--bottom").addClass("hint--right").removeClass("hint--bottom"):i()("span.hint--right").addClass("hint--bottom").removeClass("hint--right")}o(3138),window.jQuery=i(),i()((()=>{i()((()=>{i()(".quick-search .search-placeholder").each(((e,t)=>{!function(e){var t=i()(e);if(!(t.is(".search-placeholder")&&t.closest(".quick-search").length>0))throw new r("The element passed to quickSearch() must be a .search-placeholder with an ancestor .quick-search");var o=t.closest(".quick-search").is(".quick-search-tagging"),n=i()('<div class="campl-column9"><div class="campl-control-group"><div class="campl-controls"><input placeholder="Keywords" class="campl-input-block-level" type="text" value="" name="keyword"></div>'+(o?recallSlider:"")+'</div></div><div class="campl-column2"><div class="campl-controls"><button type="submit" class="campl-btn campl-primary-cta">Submit</button></div></div>'),s=i()('<form action="/search/advanced/results" class="clearfix">').append(n),a=t.closest(".quick-search").data("collection-facet");a&&s.append(i()("<input>").attr({type:"hidden",name:"facetCollection",value:a})),s.replaceAll(e)}(t)}))})),function(e){for(var t="cudlcookies=",o=document.cookie.split(";"),n=0;n<o.length;n++){for(var i=o[n];" "==i.charAt(0);)i=i.substring(1,i.length);if(0===i.indexOf(t))return i.substring(12,i.length)}return null}()||i()(".cookienotice").show().on("click","button",(()=>(u(),!1))).on("click","a",(()=>(u(),!0))),p(),function(){function e(){return document.getElementById("myDropdown").classList.toggle("show"),!1}window.onclick=function(e){if(!e.target.matches(".dropbtn")){var t,o=document.getElementsByClassName("dropdown-content");for(t=0;t<o.length;t++){var n=o[t];n.classList.contains("show")&&n.classList.remove("show")}}},i()("#menuDropdownOpenButton").on("click",(function(){e()})).on("keyup",(function(t){13===t.which&&e()})),i()("#menuDropdownCloseButton").on("click",(function(){e()}))}()})),i()((()=>{i()(window).resize(a()(h,50)),h()})),i()((()=>{i()("#searchForm button[type='reset']").click((function(){var e=i()(this).parents("form:first");e.find("*[value]").attr("value",""),e.find("*[selected]").removeAttr("selected")}))}))}},o={};function n(e){var i=o[e];if(void 0!==i)return i.exports;var s=o[e]={exports:{}};return t[e].call(s.exports,s,s.exports,n),s.exports}n.m=t,e=[],n.O=(t,o,i,s)=>{if(!o){var a=1/0;for(u=0;u<e.length;u++){for(var[o,i,s]=e[u],c=!0,r=0;r<o.length;r++)(!1&s||a>=s)&&Object.keys(n.O).every((e=>n.O[e](o[r])))?o.splice(r--,1):(c=!1,s<a&&(a=s));if(c){e.splice(u--,1);var l=i();void 0!==l&&(t=l)}}return t}s=s||0;for(var u=e.length;u>0&&e[u-1][2]>s;u--)e[u]=e[u-1];e[u]=[o,i,s]},n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e={688:0};n.O.j=t=>0===e[t];var t=(t,o)=>{var i,s,[a,c,r]=o,l=0;if(a.some((t=>0!==e[t]))){for(i in c)n.o(c,i)&&(n.m[i]=c[i]);if(r)var u=r(n)}for(t&&t(o);l<a.length;l++)s=a[l],n.o(e,s)&&e[s]&&e[s][0](),e[s]=0;return n.O(u)},o=self.webpackChunkcudl_viewer_ui=self.webpackChunkcudl_viewer_ui||[];o.forEach(t.bind(null,0)),o.push=t.bind(null,o.push.bind(o))})();var i=n.O(void 0,[592],(()=>n(483)));i=n.O(i)})();