(function(){"use strict";var e={8850:function(e,n,t){var a=t(9242),o=t(3396);const s={id:"app"};function c(e,n,t,a,c,i){const r=(0,o.up)("MetaMaskComponent");return(0,o.wg)(),(0,o.iD)("div",s,[(0,o.Wm)(r)])}var i=t(7139);const r=e=>((0,o.dD)("data-v-7e215cc6"),e=e(),(0,o.Cn)(),e),l={class:"metamask-container"},d=r((()=>(0,o._)("h1",null,"VueJS Example",-1))),h=r((()=>(0,o._)("option",{value:""},"Change Language",-1))),u=["value"],p={class:"info-status"},g=r((()=>(0,o._)("p",null,null,-1)));function m(e,n,t,s,c,r){return(0,o.wg)(),(0,o.iD)("div",l,[d,(0,o.wy)((0,o._)("select",{"onUpdate:modelValue":n[0]||(n[0]=e=>c.selectedLanguage=e),onChange:n[1]||(n[1]=(...e)=>r.changeLanguage&&r.changeLanguage(...e))},[h,((0,o.wg)(!0),(0,o.iD)(o.HY,null,(0,o.Ko)(c.availableLanguages,((e,n)=>((0,o.wg)(),(0,o.iD)("option",{key:n,value:e},(0,i.zw)(e),9,u)))),128))],544),[[a.bM,c.selectedLanguage]]),(0,o._)("div",p,[(0,o._)("p",null,"Connected chain: "+(0,i.zw)(c.chainId),1),(0,o._)("p",null,"Connected account:"+(0,i.zw)(c.account),1),(0,o._)("p",null,"Last response: "+(0,i.zw)(c.lastResponse),1),(0,o._)("p",null,"Connected: "+(0,i.zw)(c.connected),1)]),(0,o._)("button",{class:"action-button",onClick:n[2]||(n[2]=(...e)=>r.onConnect&&r.onConnect(...e))},"Connect"),(0,o._)("button",{class:"action-button",onClick:n[3]||(n[3]=(...e)=>r.onConnectAndSign&&r.onConnectAndSign(...e))},"Connect w/ sign"),(0,o._)("button",{class:"action-button",onClick:n[4]||(n[4]=(...e)=>r.eth_signTypedData_v4&&r.eth_signTypedData_v4(...e))},"eth_signTypedData_v4"),(0,o._)("button",{class:"action-button",onClick:n[5]||(n[5]=(...e)=>r.personal_sign&&r.personal_sign(...e))},"personal_sign"),(0,o._)("button",{class:"action-button",onClick:n[6]||(n[6]=(...e)=>r.sendTransaction&&r.sendTransaction(...e))},"Send transaction"),"0x1"===this.chainId?((0,o.wg)(),(0,o.iD)("button",{key:0,class:"action-button",onClick:n[7]||(n[7]=e=>r.switchChain("0x5"))},"Switch to Goerli")):((0,o.wg)(),(0,o.iD)("button",{key:1,class:"action-button",onClick:n[8]||(n[8]=e=>r.switchChain("0x1"))},"Switch to Mainnet")),(0,o._)("button",{class:"action-button",onClick:n[9]||(n[9]=(...e)=>r.addEthereumChain&&r.addEthereumChain(...e))},"Add Polygon"),(0,o._)("button",{class:"action-button",onClick:n[10]||(n[10]=e=>r.switchChain("0x89"))},"Switch to Polygon"),(0,o._)("button",{class:"action-button",onClick:n[11]||(n[11]=(...e)=>r.readOnlyCalls&&r.readOnlyCalls(...e))},"readOnlyCalls"),(0,o._)("button",{class:"action-button",onClick:n[12]||(n[12]=(...e)=>r.batchCalls&&r.batchCalls(...e))},"batch"),g,(0,o._)("button",{class:"action-button-danger",onClick:n[13]||(n[13]=(...e)=>r.terminate&&r.terminate(...e))},"TERMINATE")])}var b=t(5744);const{Buffer:C}=t(5361);var v={name:"MetaMaskComponent",data(){return{sdk:null,account:null,chainId:null,connected:!1,lastResponse:null,provider:null,availableLanguages:[],selectedLanguage:""}},created(){this.sdk=new b.MetaMaskSDK({dappMetadata:{url:window.location.href,name:"MetaMask VueJS Example Dapp"},enableDebug:!0,checkInstallationImmediately:!1,logging:{developerMode:!0},i18nOptions:{enabled:!0}})},async mounted(){await(this.sdk?.init().then((()=>{this.provider=this.sdk?.getProvider(),this.provider?.on("chainChanged",(e=>{console.log("App::Chain changed:'",e),this.chainId=e})),this.provider?.on("accountsChanged",(e=>{console.log("App::Accounts changed:'",e),this.account=e[0]})),this.provider?.on("connect",(e=>{console.log("App::connect",e),this.onConnect(),this.connected=!0})),this.provider?.on("disconnect",(e=>{console.log("App::disconnect",e),this.connected=!1})),this.availableLanguages=this.sdk?.availableLanguages??["en"]})))},methods:{async onConnectAndSign(){try{const e=await(this.sdk?.connectAndSign({msg:"Connect + Sign message"}));this.lastResponse=e}catch(e){console.warn("failed to connect..",e)}},async onConnect(){try{const e=await this.provider.request({method:"eth_requestAccounts",params:[]});this.account=e[0],console.log("request accounts",e),this.lastResponse="",this.chainId=this.provider.chainId}catch(e){console.log("request accounts ERR",e)}},async addEthereumChain(){try{const e=await this.provider.request({method:"wallet_addEthereumChain",params:[{chainId:"0x89",chainName:"Polygon",blockExplorerUrls:["https://polygonscan.com"],nativeCurrency:{symbol:"MATIC",decimals:18},rpcUrls:["https://polygon-rpc.com/"]}]});console.log("add",e),this.lastResponse=e}catch(e){console.log("ADD ERR",e)}},async eth_signTypedData_v4(){const e=JSON.stringify({domain:{chainId:this.chainId,name:"Ether Mail",verifyingContract:"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",version:"1"},message:{contents:"Hello, Bob!",attachedMoneyInEth:4.2,from:{name:"Cow",wallets:["0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826","0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF"]},to:[{name:"Bob",wallets:["0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB","0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57","0xB0B0b0b0b0b0B000000000000000000000000000"]}]},primaryType:"Mail",types:{EIP712Domain:[{name:"name",type:"string"},{name:"version",type:"string"},{name:"chainId",type:"uint256"},{name:"verifyingContract",type:"address"}],Group:[{name:"name",type:"string"},{name:"members",type:"Person[]"}],Mail:[{name:"from",type:"Person"},{name:"to",type:"Person[]"},{name:"contents",type:"string"}],Person:[{name:"name",type:"string"},{name:"wallets",type:"address[]"}]}});let n=this.account;console.debug(`sign from: ${n}`);try{if(!n)return void alert("Invalid account -- please connect using eth_requestAccounts first");const t=[n,e],a="eth_signTypedData_v4";console.debug(`ethRequest ${a}`,JSON.stringify(t,null,4)),console.debug("sign params",t);const o=await(this.provider?.request({method:a,params:t}));this.lastResponse=o,console.debug("eth_signTypedData_v4 result",o)}catch(t){this.lastResponse=t,console.error(t)}},async personal_sign(){try{const e=this.provider.selectedAddress,n="Hello World from the VueJS Example dapp!",t="0x"+C.from(n,"utf8").toString("hex"),a=await window.ethereum.request({method:"personal_sign",params:[t,e,"Example password"]});return console.log(`sign: ${a}`),a}catch(e){return console.log(e),"Error: "+e.message}},async sendTransaction(){const e="0x0000000000000000000000000000000000000000",n={to:e,from:this.provider.selectedAddress,value:"0x5AF3107A4000"};try{const e=await this.provider.request({method:"eth_sendTransaction",params:[n]});this.lastResponse=e}catch(t){console.log(t)}},async switchChain(e){console.debug(`switching to network chainId=${e}`);try{const n=await this.provider.request({method:"wallet_switchEthereumChain",params:[{chainId:e}]});console.debug("response",n)}catch(n){console.error(n)}},async readOnlyCalls(){if(this.sdk?.hasReadOnlyRPCCalls()||this.provider)try{const e=await this.provider.request({method:"eth_blockNumber",params:[]}),n=this.sdk.hasReadOnlyRPCCalls()?"infura":"MetaMask provider";this.lastResponse=`(${n}) ${e}`}catch(e){console.log("error getting the blockNumber",e),this.lastResponse="error getting the blockNumber"}else this.lastResponse("readOnlyCalls are not set and provider is not set. Please set your infuraAPIKey in the SDK Options")},async changeLanguage(){localStorage.setItem("MetaMaskSDKLng",this.selectedLanguage),window.location.reload()},async batchCalls(){if(!this.provider?.selectedAddress)return this.lastResponse="Please connect first",void console.warn("batchCalls: selectedAddress is not set");const e=[{method:"wallet_switchEthereumChain",params:[{chainId:"0x5"}]},{method:"eth_sendTransaction",params:[{to:"0x0000000000000000000000000000000000000000",from:this.provider?.selectedAddress,value:"0x5AF3107A4000"}]},{method:"personal_sign",params:["hello world",this.account]},{method:"personal_sign",params:["Another one #3",this.account]}];try{const n=await(this.provider?.request({method:"metamask_batch",params:e}));this.lastResponse=n,n.forEach(((e,n)=>{console.log(`response ${n}`,e)}))}catch(n){console.error(n),this.lastResponse=n.message}},terminate(){this.sdk?.terminate(),this.account=null,this.lastResponse="Terminated!",this.chainId=null}}},y=t(89);const f=(0,y.Z)(v,[["render",m],["__scopeId","data-v-7e215cc6"]]);var w=f,_={name:"App",components:{MetaMaskComponent:w}};const k=(0,y.Z)(_,[["render",c]]);var A=k;(0,a.ri)(A).mount("#app")}},n={};function t(a){var o=n[a];if(void 0!==o)return o.exports;var s=n[a]={exports:{}};return e[a].call(s.exports,s,s.exports,t),s.exports}t.m=e,function(){var e=[];t.O=function(n,a,o,s){if(!a){var c=1/0;for(d=0;d<e.length;d++){a=e[d][0],o=e[d][1],s=e[d][2];for(var i=!0,r=0;r<a.length;r++)(!1&s||c>=s)&&Object.keys(t.O).every((function(e){return t.O[e](a[r])}))?a.splice(r--,1):(i=!1,s<c&&(c=s));if(i){e.splice(d--,1);var l=o();void 0!==l&&(n=l)}}return n}s=s||0;for(var d=e.length;d>0&&e[d-1][2]>s;d--)e[d]=e[d-1];e[d]=[a,o,s]}}(),function(){t.n=function(e){var n=e&&e.__esModule?function(){return e["default"]}:function(){return e};return t.d(n,{a:n}),n}}(),function(){t.d=function(e,n){for(var a in n)t.o(n,a)&&!t.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:n[a]})}}(),function(){t.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)}}(),function(){var e={143:0};t.O.j=function(n){return 0===e[n]};var n=function(n,a){var o,s,c=a[0],i=a[1],r=a[2],l=0;if(c.some((function(n){return 0!==e[n]}))){for(o in i)t.o(i,o)&&(t.m[o]=i[o]);if(r)var d=r(t)}for(n&&n(a);l<c.length;l++)s=c[l],t.o(e,s)&&e[s]&&e[s][0](),e[s]=0;return t.O(d)},a=self["webpackChunkmetamasksdk_vuejs"]=self["webpackChunkmetamasksdk_vuejs"]||[];a.forEach(n.bind(null,0)),a.push=n.bind(null,a.push.bind(a))}();var a=t.O(void 0,[998],(function(){return t(8850)}));a=t.O(a)})();
//# sourceMappingURL=app.17359250.js.map