// @ts-nocheck



// An inlined version of Comlink that also exposes itself as a factory
// https://unpkg.com/comlink@4.3.1/dist/umd/comlink.min.js
const Comlink = (function Comlink() {
  const t=Symbol("Comlink.proxy"),n=Symbol("Comlink.endpoint"),r=Symbol("Comlink.releaseProxy"),a=Symbol("Comlink.thrown"),s=e=>"object"==typeof e&&null!==e||"function"==typeof e,o=new Map([["proxy",{canHandle:e=>s(e)&&e[t],serialize(e){const{port1:t,port2:n}=new MessageChannel;return i(e,t),[n,[n]]},deserialize:e=>(e.start(),u(e))}],["throw",{canHandle:e=>s(e)&&a in e,serialize({value:e}){let t;return t=e instanceof Error?{isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:{isError:!1,value:e},[t,[]]},deserialize(e){if(e.isError)throw Object.assign(new Error(e.value.message),e.value);throw e.value}}]]);function i(e,t=self){t.addEventListener("message",(function n(r){if(!r||!r.data)return;const{id:s,type:o,path:u}=Object.assign({path:[]},r.data),l=(r.data.argumentList||[]).map(y);let p;try{const t=u.slice(0,-1).reduce((e,t)=>e[t],e),n=u.reduce((e,t)=>e[t],e);switch(o){case"GET":p=n;break;case"SET":t[u.slice(-1)[0]]=y(r.data.value),p=!0;break;case"APPLY":p=n.apply(t,l);break;case"CONSTRUCT":p=m(new n(...l));break;case"ENDPOINT":{const{port1:t,port2:n}=new MessageChannel;i(e,n),p=f(t,[t])}break;case"RELEASE":p=void 0;break;default:return}}catch(e){p={value:e,[a]:0}}Promise.resolve(p).catch(e=>({value:e,[a]:0})).then(e=>{const[r,a]=E(e);t.postMessage(Object.assign(Object.assign({},r),{id:s}),a),"RELEASE"===o&&(t.removeEventListener("message",n),c(t))})})),t.start&&t.start()}function c(e){(function(e){return"MessagePort"===e.constructor.name})(e)&&e.close()}function u(e,t){return function e(t,a=[],s=function(){}){let o=!1;const i=new Proxy(s,{get(n,s){if(l(o),s===r)return()=>g(t,{type:"RELEASE",path:a.map(e=>e.toString())}).then(()=>{c(t),o=!0});if("then"===s){if(0===a.length)return{then:()=>i};const e=g(t,{type:"GET",path:a.map(e=>e.toString())}).then(y);return e.then.bind(e)}return e(t,[...a,s])},set(e,n,r){l(o);const[s,i]=E(r);return g(t,{type:"SET",path:[...a,n].map(e=>e.toString()),value:s},i).then(y)},apply(r,s,i){l(o);const c=a[a.length-1];if(c===n)return g(t,{type:"ENDPOINT"}).then(y);if("bind"===c)return e(t,a.slice(0,-1));const[u,d]=p(i);return g(t,{type:"APPLY",path:a.map(e=>e.toString()),argumentList:u},d).then(y)},construct(e,n){l(o);const[r,s]=p(n);return g(t,{type:"CONSTRUCT",path:a.map(e=>e.toString()),argumentList:r},s).then(y)}});return i}(e,[],t)}function l(e){if(e)throw new Error("Proxy has been released and is not useable")}function p(e){const t=e.map(E);return[t.map(e=>e[0]),(n=t.map(e=>e[1]),Array.prototype.concat.apply([],n))];var n}const d=new WeakMap;function f(e,t){return d.set(e,t),e}function m(e){return Object.assign(e,{[t]:!0})}function E(e){for(const[t,n]of o)if(n.canHandle(e)){const[r,a]=n.serialize(e);return[{type:"HANDLER",name:t,value:r},a]}return[{type:"RAW",value:e},d.get(e)||[]]}function y(e){switch(e.type){case"HANDLER":return o.get(e.name).deserialize(e.value);case"RAW":return e.value}}function g(e,t,n){return new Promise(r=>{const a=new Array(4).fill(0).map(()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)).join("-");e.addEventListener("message",(function t(n){n.data&&n.data.id&&n.data.id===a&&(e.removeEventListener("message",t),r(n.data))})),e.start&&e.start(),e.postMessage(Object.assign({id:a},t),n)})};
  return {wrap:u,expose:i,Comlink:Comlink}
})();


/**

* see https://github.com/developit/workerize/issues/37
* @example
* const worker = comlinker(exports => {
* 	exports.foo = async () => 'bar';
* });
* worker.foo().then(console.log);
 */
export default function comlinker<F = Record<string , (...params?:any)=>Promise<any>>>(func:(exports:Record<string , Function>) =>void):F {
    /*
      return Comlink.wrap(new Worker(URL.createObjectURL(new Blob(['importScripts("https://unpkg.com/comlink@4.2.0/dist/umd/comlink.min.js");var exports={},module={exports:exports};('+func+')(exports);Comlink.expose(module.exports);']))));
      */
    return Comlink.wrap(new Worker(URL.createObjectURL(new Blob(['var Comlink='+Comlink.Comlink+'(),exports={},module={exports:exports};('+func+')(exports);Comlink.expose(module.exports);']))));
}
