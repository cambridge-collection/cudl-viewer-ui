(()=>{var e,t={9905:(e,t,n)=>{function a(){function e(){dataLayer.push(arguments)}window.dataLayer=window.dataLayer||[],e("js",new Date),e("config","G-89DQZCHV21")}n(8526),window.addEventListener("load",(function(){window.cookieconsent.initialise({revokeBtn:'<div class="cc-revoke"></div>',type:"opt-in",position:"top",theme:"classic",palette:{popup:{background:"#ccc",text:"#444"},button:{background:"#8c6",text:"#fff"}},content:{message:"This website uses cookies.",link:"Privacy Statement",href:"/help#cookies"},onInitialise:function(e){e==cookieconsent.status.allow&&a()},onStatusChange:function(e){this.hasConsented()&&a()}})}))},4514:(e,t,n)=>{"use strict";var a=n(9755),o=n.n(a),r=(n(1629),n(4333)),c=(n(9858),n(9905),n(7216));class s extends c.Z{}var i=n(7187);function l(){!function(e,t,n){let a;var o=new Date;o.setTime(o.getTime()+158112e5),a="; expires="+o.toGMTString(),document.cookie="cudlcookies=true"+a+"; path=/"}(),o()(".cookienotice").hide()}new(n.n(i)());var d=n(8583),u=n.n(d),p=n(3218),f=n.n(p);function h(){let e=o()(document.body).data("context")||{};if(!f()(e))throw new Error(`Invalid context data: expected an object but found: ${e}`);return e}let m,g=0;function v(){let e;const t=document.getElementsByClassName("mySlides"),n=document.getElementsByClassName("dot");if(void 0!==t&&0!==t.length){for(e=0;e<t.length;e++)t[e].style.display="none";for(g++,g>t.length&&(g=1),e=0;e<n.length;e++)n[e].className=n[e].className.replace(" active","");t[g-1].style.display="block",n[g-1].className+=" active",setTimeout(v,5e3)}}function b(e,t){return e[t[0]]=t[1],e}function w(e){return decodeURIComponent(e.replace(/\+/g," "))}function y(e){var t=Object.keys(e);return t.sort(),k(t.map((function(t){return[t,e[t]]})))}function k(e){return"?"+e.map((function(e){return encodeURIComponent(e[0])+"="+encodeURIComponent(e[1])})).join("&")}function x(e,t){return(n=e,a=t,Object.keys(Object.keys(n).concat(Object.keys(a)).reduce((function(e,t){return e[t]=void 0,e}),{}))).filter((function(n){return e.hasOwnProperty(n)!==t.hasOwnProperty(n)||e[n]!==t[n]})).map((function(n){var a={};return e.hasOwnProperty(n)&&(a.left=e[n]),t.hasOwnProperty(n)&&(a.right=t[n]),[n,a]})).reduce(b,{});var n,a}function O(e){var t=parseInt(e.page),n=Object.assign({},e,{start:(t-1)*z,end:t*z});return delete n.page,delete n.tagging,y(n)}function j(e){var t=e.item,n={};"portrait"===t.thumbnailOrientation?n.height="100%":"landscape"===t.thumbnailOrientation&&(n.width="100%");var a=t.title;return"essay"===e.itemType&&(a="Essay: "+a),o()("<div>").attr("class","collections_carousel_item").append(o()("<div>").addClass("collections_carousel_image_box col-md-4").append(o()("<div>").addClass("collections_carousel_image").append(o()("<a>").attr("href","/view/"+encodeURIComponent(t.id)+"/"+encodeURIComponent(e.startPage)).append(o()("<img>").attr({src:e.pageThumbnailURL,alt:t.id}).css(n)))),o()("<div>").addClass("collections_carousel_text col-md-8").append(o()("<h3>").append(o()("<a>").attr("href","/view/"+encodeURIComponent(t.id)+"/"+encodeURIComponent(e.startPage)).append(a),o()("<span>").css({color:"#999","font-weight":"normal","font-size":"14px"}).append(" (",o()("<span>").attr("title","Shelf locator").text((t.shelfLocator||"").replace(/ /g," ")),String(t.shelfLocator)?" ":"","Page: ",document.createTextNode(e.startPageLabel),")")),document.createTextNode(t.abstractShort),o()("<br><br>"),o()("<ul>").append(e.snippets.filter(Boolean).map((function(e){return o()("<li>").append(o()("<span>").html((t=e,(t=t.replace(/<b>/g,'<span class="campl-search-term">')).replace(/<\/b>/g,"</span>"))))[0];var t})))),o()("<div>").addClass("clear"))[0]}function C(e){return e.map(j)}function T(e){var t=e<0,n=(e=Math.abs(e))-Math.floor(e);e=Math.floor(e);for(var a,o=[];;){if(e<1e3){o.unshift(e);break}o.unshift((a=""+(e-1e3*Math.floor(e/1e3)),3,"0",Array(Math.max(0,3-a.length)+1).join("0")+a)),e=Math.floor(e/1e3)}return(t?"-":"")+o.join(",")+(""+n).substr(1)}function S(e){return"facet"+e.substr(0,1).toUpperCase()+e.substr(1)}function _(e,t,n){var a=Object.assign({},e);a[S(t.field)]=n.value;var r=y(a);return o()("<li>").append(o()("<a>").attr("href",r).data("state",a).text(n.value),document.createTextNode(" ("+n.occurrences+")"))[0]}function N(e,t){return o()(t.map((function(t){return o()("<li>").append(o()("<strong>").append(o()("<span>").html("&#9662 "),document.createTextNode(t.label)),o()("<div>").addClass("search-facet-expansion").append(P(e,t)),o()("<ul>").addClass("campl-unstyled-list").append(t.facets.map(_.bind(void 0,e,t))),o()("<div>").addClass("search-facet-expansion").append(function(e,t){let n=t.field,a=t.totalFacets;if(t.facets.length<a){let t=Object.assign({},e);t.expandFacet=n;let a=y(t);return o()("<a>").attr("href",a).text("more").prop("title","More "+n+" facets")}}(e,t),P(e,t)))[0]})))}function P(e,t){let n=e.expandFacet,a=t.field;if(n===a){let t=Object.assign({},e);t.expandFacet="";let n=y(t);return o()("<a>").attr("href",n).text("less").prop("title","Fewer "+a+" facets")}}function I(e,t){var n=Object.assign({},e);delete n[S(t.field)];var a=y(n);return o()("<div>").addClass("search-facet-selected").append(o()("<a>").addClass("search-close").attr("href",a).attr("title","Remove").data("state",n).append("in ",o()("<b>").append(o()("<span>").text(t.value)[0])," (",document.createTextNode(t.field),") ❌"))[0]}function q(e,t){return t.map(I.bind(void 0,e))}function E(e){var t=x(F,e);0!==Object.keys(t).length&&(1===Object.keys(t).length&&t.page?function(e){U(!0),m&&m.abort();var t,n=Date.now();m=t=o().ajax({url:"/search/JSON"+O(e)}).always((function(){U(!1),m===t&&(m=null)})).done((function(t){J((()=>B.pagination(parseInt(e.page)))),o()("#reqtime").text((Date.now()-n)/1e3+" seconds"),o()("#collections_carousel").empty().append(C(t))}))}(e):function(e){if("number"!=typeof e.page)throw new Error("state.page not a number");var t,n=Date.now();U(!0),m&&m.abort(),m=t=o().ajax({url:"/search/JSONAdvanced"+O(e)}).always((function(){U(!1),m===t&&(m=null)})).done((function(t){Q(t.info.hits,z);var a,r,c=Date.now()-n;o()("#reqtime").text(c/1e3+" seconds"),o()("#collections_carousel").empty().append(C(t.items)),o()(".resultcount").empty().append((a=t.info.hits,r=c,[document.createTextNode("About "+T(a)+" results ("),o()("<span>").attr("id","reqtime").text(r/1e3+" seconds")[0],document.createTextNode(")")])),o()(".searchexample").toggleClass("hidden",t.info.hits>0),o()("#tree").empty().append(N(e,t.facets.available)),o()("#selected_facets").empty().append(q(e,t.facets.selected)),o()(".query-actions .change-query").attr("href",function(e){return"./query"+k(Object.keys(e).filter((function(e){return"page"!==e})).map((function(t){return[t,e[t]]})))}(e))}))}(e),F=e)}function M(e,t){if("push"!==(t=t||"push")&&"replace"!==t)throw new Error("Unknown mode: "+t);if(0!==Object.keys(x(F,e)).length){var n=y(e);("replace"===t?history.replaceState:history.pushState).call(history,e,"",n),E(e)}}function D(e,t){t=t||{};var n=Object.assign({page:1},t,e.replace(/^\?/,"").split("&").map((function(e){var t=e.indexOf("=");return-1==t?[w(e),""]:[w(e.substr(0,t)),w(e.substr(t+1))]})).reduce(b,{}));return n.page=parseInt(n.page),n}n(3138),window.jQuery=o(),o()((()=>{(function(e=o()){let t=h(),n=t.csrf&&t.csrf.token,a=t.csrf&&t.csrf.header;if(!n)throw new s("csrf.token missing from context");if(!a)throw new s("csrf.header missing from context");var r,c;e.ajaxPrefilter((r=n,c=a,function(e,t,n){e.crossDomain||["GET","OPTIONS"].includes(e.type)||(e.headers=u()({},e.headers,{[c]:r}))}))})(),o()((()=>{o()(".quick-search .search-placeholder").each(((e,t)=>{!function(e){var t=o()(e);if(!(t.is(".search-placeholder")&&t.closest(".quick-search").length>0))throw new s("The element passed to quickSearch() must be a .search-placeholder with an ancestor .quick-search");var n=t.closest(".quick-search").is(".quick-search-tagging"),a=o()('<div class="campl-column9"><div class="campl-control-group"><div class="campl-controls"><input placeholder="Keywords" class="campl-input-block-level" type="text" value="" name="keyword"></div>'+(n?recallSlider:"")+'</div></div><div class="campl-column2"><div class="campl-controls"><button type="submit" class="campl-btn campl-primary-cta">Submit</button></div></div>'),r=o()('<form action="/search/advanced/results" class="clearfix">').append(a),c=t.closest(".quick-search").data("collection-facet");c&&r.append(o()("<input>").attr({type:"hidden",name:"facetCollection",value:c})),r.replaceAll(e)}(t)}))})),function(e){for(var t="cudlcookies=",n=document.cookie.split(";"),a=0;a<n.length;a++){for(var o=n[a];" "==o.charAt(0);)o=o.substring(1,o.length);if(0===o.indexOf(t))return o.substring(12,o.length)}return null}()||o()(".cookienotice").show().on("click","button",(()=>(l(),!1))).on("click","a",(()=>(l(),!0))),v(),function(){function e(){return document.getElementById("myDropdown").classList.toggle("show"),!1}window.onclick=function(e){if(!e.target.matches(".dropbtn")){var t,n=document.getElementsByClassName("dropdown-content");for(t=0;t<n.length;t++){var a=n[t];a.classList.contains("show")&&a.classList.remove("show")}}},o()("#menuDropdownOpenButton").on("click",(function(){e()})).on("keyup",(function(t){13===t.which&&e()})),o()("#menuDropdownCloseButton").on("click",(function(){e()}))}()})),n(7382),window.formatNumber=T;let L=0;function U(e){var t=L;if(L=Math.max(0,L+(e?1:-1)),0===t&&L){var n=o()("body");A.spin(n[0]),n.addClass("loading")}else t&&0===L&&(n=o()("body"),A.stop(),n.removeClass("loading"))}let R,B,A,F,z=20,G=!0;function J(e){G=!1;try{e()}finally{G=!0}}function Q(e,t){const n={dataSource:new Array(e).fill(0),locator:"items",pageNumber:1,pageSize:t,totalNumber:e,hideOnlyOnePage:!0,callback:function(e,t){var n;n=t.pageNumber,void 0!==B&&(G&&(document.body.scrollTop=document.documentElement.scrollTop=o()("#collections_carousel").offset().top-50),M(Object.assign({},F,{page:""+n})))}};B=o()(".pagination:first").pagination(n)}o()((()=>{!function(){let e=h();R=e.resultCount,A=new r.$({lines:13,length:0,width:27,radius:63,scale:1,corners:1,color:"#000",fadeColor:"transparent",speed:1.5,rotate:0,animation:"spinner-line-fade-quick",direction:1,zIndex:2e9,className:"spinner",top:"50%",left:"50%",shadow:"0 0 1px transparent",position:"fixed"}),F=D(window.location.search),J((()=>Q(R,z)));let t=F.page;delete F.page,M(Object.assign({},F,{page:t}),"replace"),o()(window).on("popstate",(function(e){var t=e.originalEvent.state;null!==t&&E(t)})),o()("#tree,#selected_facets").on("click","a",(function(e){return M(o()(e.currentTarget).data("state")||D(e.currentTarget.search)),!1}))}()}))}},n={};function a(e){var o=n[e];if(void 0!==o)return o.exports;var r=n[e]={id:e,loaded:!1,exports:{}};return t[e].call(r.exports,r,r.exports,a),r.loaded=!0,r.exports}a.m=t,e=[],a.O=(t,n,o,r)=>{if(!n){var c=1/0;for(d=0;d<e.length;d++){for(var[n,o,r]=e[d],s=!0,i=0;i<n.length;i++)(!1&r||c>=r)&&Object.keys(a.O).every((e=>a.O[e](n[i])))?n.splice(i--,1):(s=!1,r<c&&(c=r));if(s){e.splice(d--,1);var l=o();void 0!==l&&(t=l)}}return t}r=r||0;for(var d=e.length;d>0&&e[d-1][2]>r;d--)e[d]=e[d-1];e[d]=[n,o,r]},a.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return a.d(t,{a:t}),t},a.d=(e,t)=>{for(var n in t)a.o(t,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},a.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.nmd=e=>(e.paths=[],e.children||(e.children=[]),e),(()=>{var e={705:0};a.O.j=t=>0===e[t];var t=(t,n)=>{var o,r,[c,s,i]=n,l=0;if(c.some((t=>0!==e[t]))){for(o in s)a.o(s,o)&&(a.m[o]=s[o]);if(i)var d=i(a)}for(t&&t(n);l<c.length;l++)r=c[l],a.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return a.O(d)},n=self.webpackChunkcudl_viewer_ui=self.webpackChunkcudl_viewer_ui||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))})();var o=a.O(void 0,[592],(()=>a(4514)));o=a.O(o)})();