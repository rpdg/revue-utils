// @ts-nocheck

    
    
// An inlined version of Comlink that also exposes itself as a factory
// https://unpkg.com/comlink@4.2.0/dist/umd/comlink.min.js
const Comlink = (function Comlink() {const t=Symbol("Comlink.proxy"),n=Symbol("Comlink.endpoint"),r=Symbol("Comlink.releaseProxy"),a=new WeakSet,s=new Map([["proxy",{canHandle:e=>e&&e[t],serialize(e){const{port1:t,port2:n}=new MessageChannel;return o(e,t),[n,[n]]},deserialize:e=>(e.start(),c(e))}],["throw",{canHandle:e=>a.has(e),serialize(e){const t=e instanceof Error;let n=e;return t&&(n={isError:t,message:e.message,stack:e.stack}),[n,[]]},deserialize(e){if(e.isError)throw Object.assign(new Error,e);throw e}}]]);function o(e,t=self){t.addEventListener("message",(function n(r){if(!r||!r.data)return;const{id:s,type:c,path:u}=Object.assign({path:[]},r.data),p=(r.data.argumentList||[]).map(h);let d;try{const t=u.slice(0,-1).reduce((e,t)=>e[t],e),n=u.reduce((e,t)=>e[t],e);switch(c){case 0:d=n;break;case 1:t[u.slice(-1)[0]]=h(r.data.value),d=!0;break;case 2:d=n.apply(t,p);break;case 3:d=f(new n(...p));break;case 4:{const{port1:t,port2:n}=new MessageChannel;o(e,n),d=l(t,[t])}break;case 5:d=void 0}}catch(e){d=e,a.add(e)}Promise.resolve(d).catch(e=>(a.add(e),e)).then(e=>{const[r,a]=m(e);t.postMessage(Object.assign(Object.assign({},r),{id:s}),a),5===c&&(t.removeEventListener("message",n),i(t))})})),t.start&&t.start()}function i(e){(function(e){return"MessagePort"===e.constructor.name})(e)&&e.close()}function c(e,t){return function e(t,a=[],s=function(){}){let o=!1;const c=new Proxy(s,{get(n,s){if(u(o),s===r)return()=>g(t,{type:5,path:a.map(e=>e.toString())}).then(()=>{i(t),o=!0});if("then"===s){if(0===a.length)return{then:()=>c};const e=g(t,{type:0,path:a.map(e=>e.toString())}).then(h);return e.then.bind(e)}return e(t,[...a,s])},set(e,n,r){u(o);const[s,i]=m(r);return g(t,{type:1,path:[...a,n].map(e=>e.toString()),value:s},i).then(h)},apply(r,s,i){u(o);const c=a[a.length-1];if(c===n)return g(t,{type:4}).then(h);if("bind"===c)return e(t,a.slice(0,-1));const[d,l]=p(i);return g(t,{type:2,path:a.map(e=>e.toString()),argumentList:d},l).then(h)},construct(e,n){u(o);const[r,s]=p(n);return g(t,{type:3,path:a.map(e=>e.toString()),argumentList:r},s).then(h)}});return c}(e,[],t)}function u(e){if(e)throw new Error("Proxy has been released and is not useable")}function p(e){const t=e.map(m);return[t.map(e=>e[0]),(n=t.map(e=>e[1]),Array.prototype.concat.apply([],n))];var n}const d=new WeakMap;function l(e,t){return d.set(e,t),e}function f(e){return Object.assign(e,{[t]:!0})}function m(e){for(const[t,n]of s)if(n.canHandle(e)){const[r,a]=n.serialize(e);return[{type:3,name:t,value:r},a]}return[{type:0,value:e},d.get(e)||[]]}function h(e){switch(e.type){case 3:return s.get(e.name).deserialize(e.value);case 0:return e.value}}function g(e,t,n){return new Promise(r=>{const a=new Array(4).fill(0).map(()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)).join("-");e.addEventListener("message",(function t(n){n.data&&n.data.id&&n.data.id===a&&(e.removeEventListener("message",t),r(n.data))})),e.start&&e.start(),e.postMessage(Object.assign({id:a},t),n)})}
    return {wrap:c,expose:o,Comlink:Comlink}
})();


/**

* see https://github.com/developit/workerize/issues/37
* @example
* const worker = comlinker(exports => {
* 	exports.foo = async () => 'bar';
* });
* worker.foo().then(console.log);

* typescript:
const worker1 = comlinker<{ foo: (n:number) => Promise<number> }>((exports) => {
	exports.foo = async (n:number) => n+1
});
worker1.foo(5).then(console.log);
 */
export default function comlinker<F = Record<string , (...params?:any)=>Promise<any>>>(func:(exports:Record<string , Function>) =>void):F {
  /*
    return Comlink.wrap(new Worker(URL.createObjectURL(new Blob(['importScripts("https://unpkg.com/comlink@4.2.0/dist/umd/comlink.min.js");var exports={},module={exports:exports};('+func+')(exports);Comlink.expose(module.exports);']))));
    */
  return Comlink.wrap(new Worker(URL.createObjectURL(new Blob(['var Comlink='+Comlink.Comlink+'(),exports={},module={exports:exports};('+func+')(exports);Comlink.expose(module.exports);']))));
}
