function m(t){if(!Number.isSafeInteger(t)||t<0)throw new Error(`positive integer expected, not ${t}`)}function Y(t){return t instanceof Uint8Array||t!=null&&typeof t=="object"&&t.constructor.name==="Uint8Array"}function h(t,...e){if(!Y(t))throw new Error("Uint8Array expected");if(e.length>0&&!e.includes(t.length))throw new Error(`Uint8Array expected of length ${e}, not of length=${t.length}`)}function L(t,e=!0){if(t.destroyed)throw new Error("Hash instance has been destroyed");if(e&&t.finished)throw new Error("Hash#digest() has already been called")}function I(t,e){h(t);let n=e.outputLen;if(t.length<n)throw new Error(`digestInto() expects output buffer of length at least ${n}`)}var g=BigInt(4294967295),O=BigInt(32);function Z(t,e=!1){return e?{h:Number(t&g),l:Number(t>>O&g)}:{h:Number(t>>O&g)|0,l:Number(t&g)|0}}function U(t,e=!1){let n=new Uint32Array(t.length),r=new Uint32Array(t.length);for(let o=0;o<t.length;o++){let{h:s,l:i}=Z(t[o],e);[n[o],r[o]]=[s,i]}return[n,r]}var S=(t,e,n)=>t<<n|e>>>32-n,H=(t,e,n)=>e<<n|t>>>32-n,T=(t,e,n)=>e<<n-32|t>>>64-n,R=(t,e,n)=>t<<n-32|e>>>64-n;var P=t=>new Uint32Array(t.buffer,t.byteOffset,Math.floor(t.byteLength/4));var A=new Uint8Array(new Uint32Array([287454020]).buffer)[0]===68,tt=t=>t<<24&4278190080|t<<8&16711680|t>>>8&65280|t>>>24&255;function k(t){for(let e=0;e<t.length;e++)t[e]=tt(t[e])}function et(t){if(typeof t!="string")throw new Error(`utf8ToBytes expected string, got ${typeof t}`);return new Uint8Array(new TextEncoder().encode(t))}function w(t){return typeof t=="string"&&(t=et(t)),h(t),t}var y=class{clone(){return this._cloneInto()}},Lt={}.toString;function F(t){let e=r=>t().update(w(r)).digest(),n=t();return e.outputLen=n.outputLen,e.blockLen=n.blockLen,e.create=()=>t(),e}function N(t){let e=(r,o)=>t(o).update(w(r)).digest(),n=t({});return e.outputLen=n.outputLen,e.blockLen=n.blockLen,e.create=r=>t(r),e}var X=[],C=[],V=[],nt=BigInt(0),d=BigInt(1),rt=BigInt(2),ot=BigInt(7),it=BigInt(256),st=BigInt(113);for(let t=0,e=d,n=1,r=0;t<24;t++){[n,r]=[r,(2*n+3*r)%5],X.push(2*(5*r+n)),C.push((t+1)*(t+2)/2%64);let o=nt;for(let s=0;s<7;s++)e=(e<<d^(e>>ot)*st)%it,e&rt&&(o^=d<<(d<<BigInt(s))-d);V.push(o)}var[ct,ft]=U(V,!0),j=(t,e,n)=>n>32?T(t,e,n):S(t,e,n),$=(t,e,n)=>n>32?R(t,e,n):H(t,e,n);function ut(t,e=24){let n=new Uint32Array(10);for(let r=24-e;r<24;r++){for(let i=0;i<10;i++)n[i]=t[i]^t[i+10]^t[i+20]^t[i+30]^t[i+40];for(let i=0;i<10;i+=2){let c=(i+8)%10,f=(i+2)%10,p=n[f],a=n[f+1],K=j(p,a,1)^n[c],Q=$(p,a,1)^n[c+1];for(let x=0;x<50;x+=10)t[i+x]^=K,t[i+x+1]^=Q}let o=t[2],s=t[3];for(let i=0;i<24;i++){let c=C[i],f=j(o,s,c),p=$(o,s,c),a=X[i];o=t[a],s=t[a+1],t[a]=f,t[a+1]=p}for(let i=0;i<50;i+=10){for(let c=0;c<10;c++)n[c]=t[i+c];for(let c=0;c<10;c++)t[i+c]^=~n[(c+2)%10]&n[(c+4)%10]}t[0]^=ct[r],t[1]^=ft[r]}n.fill(0)}var b=class t extends y{constructor(e,n,r,o=!1,s=24){if(super(),this.blockLen=e,this.suffix=n,this.outputLen=r,this.enableXOF=o,this.rounds=s,this.pos=0,this.posOut=0,this.finished=!1,this.destroyed=!1,m(r),0>=this.blockLen||this.blockLen>=200)throw new Error("Sha3 supports only keccak-f1600 function");this.state=new Uint8Array(200),this.state32=P(this.state)}keccak(){A||k(this.state32),ut(this.state32,this.rounds),A||k(this.state32),this.posOut=0,this.pos=0}update(e){L(this);let{blockLen:n,state:r}=this;e=w(e);let o=e.length;for(let s=0;s<o;){let i=Math.min(n-this.pos,o-s);for(let c=0;c<i;c++)r[this.pos++]^=e[s++];this.pos===n&&this.keccak()}return this}finish(){if(this.finished)return;this.finished=!0;let{state:e,suffix:n,pos:r,blockLen:o}=this;e[r]^=n,n&128&&r===o-1&&this.keccak(),e[o-1]^=128,this.keccak()}writeInto(e){L(this,!1),h(e),this.finish();let n=this.state,{blockLen:r}=this;for(let o=0,s=e.length;o<s;){this.posOut>=r&&this.keccak();let i=Math.min(r-this.posOut,s-o);e.set(n.subarray(this.posOut,this.posOut+i),o),this.posOut+=i,o+=i}return e}xofInto(e){if(!this.enableXOF)throw new Error("XOF is not possible for this instance");return this.writeInto(e)}xof(e){return m(e),this.xofInto(new Uint8Array(e))}digestInto(e){if(I(e,this),this.finished)throw new Error("digest() was already called");return this.writeInto(e),this.destroy(),e}digest(){return this.digestInto(new Uint8Array(this.outputLen))}destroy(){this.destroyed=!0,this.state.fill(0)}_cloneInto(e){let{blockLen:n,suffix:r,outputLen:o,rounds:s,enableXOF:i}=this;return e||(e=new t(n,r,o,i,s)),e.state32.set(this.state32),e.pos=this.pos,e.posOut=this.posOut,e.finished=this.finished,e.rounds=s,e.suffix=r,e.outputLen=o,e.enableXOF=i,e.destroyed=this.destroyed,e}},u=(t,e,n)=>F(()=>new b(e,t,n)),Et=u(6,144,224/8),It=u(6,136,256/8),Ot=u(6,104,384/8),Ut=u(6,72,512/8),St=u(1,144,224/8),at=u(1,136,256/8),Ht=u(1,104,384/8),Tt=u(1,72,512/8),v=(t,e,n)=>N((r={})=>new b(e,t,r.dkLen===void 0?n:r.dkLen,!0)),Rt=v(31,168,128/8),Pt=v(31,136,256/8);function z(t){if(Array.isArray(t)){let n=[],r=0;for(let o=0;o<t.length;o++){let s=z(t[o]);n.push(s),r+=s.length}return W(D(r,192),...n)}let e=J(t);return e.length===1&&e[0]<128?e:W(D(e.length,128),e)}function l(t,e,n){if(n>t.length)throw new Error("invalid RLP (safeSlice): end slice of Uint8Array out-of-bounds");return t.slice(e,n)}function M(t){if(t[0]===0)throw new Error("invalid RLP: extra zeros");return q(dt(t))}function D(t,e){if(t<56)return Uint8Array.from([t+e]);let n=E(t),r=n.length/2,o=E(e+55+r);return Uint8Array.from(B(o+n))}function lt(t,e=!1){if(typeof t>"u"||t===null||t.length===0)return Uint8Array.from([]);let n=J(t),r=_(n);if(e)return{data:r.data,remainder:r.remainder.slice()};if(r.remainder.length!==0)throw new Error("invalid RLP: remainder must be zero");return r.data}function _(t){let e,n,r,o,s,i=[],c=t[0];if(c<=127)return{data:t.slice(0,1),remainder:t.subarray(1)};if(c<=183){if(e=c-127,c===128?r=Uint8Array.from([]):r=l(t,1,e),e===2&&r[0]<128)throw new Error("invalid RLP encoding: invalid prefix, single byte < 0x80 are not prefixed");return{data:r,remainder:t.subarray(e)}}else if(c<=191){if(n=c-182,t.length-1<n)throw new Error("invalid RLP: not enough bytes for string length");if(e=M(l(t,1,n)),e<=55)throw new Error("invalid RLP: expected string length to be greater than 55");return r=l(t,n,e+n),{data:r,remainder:t.subarray(e+n)}}else if(c<=247){for(e=c-191,o=l(t,1,e);o.length;)s=_(o),i.push(s.data),o=s.remainder;return{data:i,remainder:t.subarray(e)}}else{if(n=c-246,e=M(l(t,1,n)),e<56)throw new Error("invalid RLP: encoded list too short");let f=n+e;if(f>t.length)throw new Error("invalid RLP: total length is larger than the data");for(o=l(t,n,f);o.length;)s=_(o),i.push(s.data),o=s.remainder;return{data:i,remainder:t.subarray(f)}}}var ht=Array.from({length:256},(t,e)=>e.toString(16).padStart(2,"0"));function dt(t){let e="";for(let n=0;n<t.length;n++)e+=ht[t[n]];return e}function q(t){let e=Number.parseInt(t,16);if(Number.isNaN(e))throw new Error("Invalid byte sequence");return e}function B(t){if(typeof t!="string")throw new TypeError("hexToBytes: expected string, got "+typeof t);if(t.length%2)throw new Error("hexToBytes: received invalid unpadded hex");let e=new Uint8Array(t.length/2);for(let n=0;n<e.length;n++){let r=n*2;e[n]=q(t.slice(r,r+2))}return e}function W(...t){if(t.length===1)return t[0];let e=t.reduce((r,o)=>r+o.length,0),n=new Uint8Array(e);for(let r=0,o=0;r<t.length;r++){let s=t[r];n.set(s,o),o+=s.length}return n}function pt(t){return new TextEncoder().encode(t)}function E(t){if(t<0)throw new Error("Invalid integer as argument, must be unsigned!");let e=t.toString(16);return e.length%2?`0${e}`:e}function xt(t){return t.length%2?`0${t}`:t}function G(t){return t.length>=2&&t[0]==="0"&&t[1]==="x"}function gt(t){return typeof t!="string"?t:G(t)?t.slice(2):t}function J(t){if(t instanceof Uint8Array)return t;if(typeof t=="string")return G(t)?B(xt(gt(t))):pt(t);if(typeof t=="number"||typeof t=="bigint")return t?B(E(t)):Uint8Array.from([]);if(t==null)return Uint8Array.from([]);throw new Error("toBytes: received unsupported type "+typeof t)}var yt={encode:z,decode:lt};export{yt as RLP,at as keccak256};
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/