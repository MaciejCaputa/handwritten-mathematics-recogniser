/*! (C) 2017 Andrea Giammarchi */
"object"==typeof module?"import"in module||(module.constructor.prototype["import"]=function(e){var t=this;return Promise.resolve().then(function(){return t.require(e)})}):!function e(t,n){var r=/^(?:[a-z]+:)?\/\//,o=/^[a-zA-Z_-]/,s=t._||n.getAttribute("data-main").replace(o,"./$&"),i=function(e){if(r.test(e))return e;if(o.test(e))return d._path(e);for(var t,n=s.slice(0,s.lastIndexOf("/")),i=e.length,u=0,c=0;u<i;c=u+1)if(u=e.indexOf("/",c),u<0)u=i,n+="/"+e.slice(c),/\.js$/i.test(n)||(n+=".js");else if(0===u)n="";else{for(t=c,c=u;c&&"."===e.charAt(c-1);)--c;switch(u-c){case 0:n+="/"+e.slice(t,u);break;case 1:break;case 2:n=n.slice(0,n.lastIndexOf("/"))}}return n},u=function(e,t,n){var r=document.documentElement,o=document.createElement("script");o.setAttribute("nonce",d._nonce),o.textContent="module.$(function(){var module="+d._cjs+'(arguments[0]),__filename=module.filename,__dirname=__filename.slice(0,__filename.lastIndexOf("/")),require=module.require,exports=module.exports;(function(){"use strict";\n'+e.responseText+";\n}.call(exports));return module.exports;}(module));",d._=t,d.$=function(e){n(d._cache[t]=e)},setTimeout(function(){r.removeChild(o)},1),r.appendChild(o)},c=function(e,t){throw d._cache[e]=new Error(t.statusText)},a=function(e){var t,n=e,r=/^((?:[a-z]+?:\/\/)?[^\/]+)\/([^@]+)@latest(\/.*)?$/.exec(e),o=function(e){t=e},s=new XMLHttpRequest;if(r){if(s.open("GET","http://www.3site.eu/latest/?@="+r[2],!1),s.send(null),!(s.status<400))return c(e,s);t=JSON.parse(s.responseText),n=r[1]+"/"+r[2]+"@"+t.version+(r[3]||"")}return s=new XMLHttpRequest,s.open("GET",n,!1),s.send(t=null),s.status<400?u(s,e,o):c(e,s),t},l={},m={filename:s,exports:l,require:function(e){var t=i(e);return d._cache[t]||a(t)},"import":function(e){var t=i(e);return Promise.resolve(d._cache[t]||(d._cache[t]=new Promise(function(e,n){var r=new XMLHttpRequest;r.open("GET",t,!0),r.onreadystatechange=function(){4==r.readyState&&(r.status<400?u(r,t,e):n(new Error(r.statusText)))},r.send(null)})))}},d=window.module||m;return d===m&&(window.global=window,window.module=m,window.process={browser:!0},m._cache=Object.create(null),m._nonce=n.getAttribute("nonce"),m._cjs=""+e,m._path=function(e){var t=e.indexOf("/"),n=e.length;return"https://unpkg.com/"+e.slice(0,t<0?n:t)+"@latest"+(t<0?"":e.slice(t))},m["import"]("./"+s.split("/").pop())),m}({_:""},document.getElementById("common-js"));