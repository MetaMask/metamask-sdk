import{P as m,b as u,d as w,h as p,j as g,k as I,c as x,e as y,g as E,i as T,f as V,p as b,t as H,v as q,w as P,a as R}from"./index-daa00df5.js";class r extends Error{constructor(e){super(e.message),this.message=e.message,this.code=e.code,this.data=e.data}}const c=(s,e)=>{let t;s.request?t=s.request.bind(s):s.sendAsync&&(t=d(s));const i=async({method:a,params:o})=>{const n=a;if(e&&e[n]===null)throw new r({code:4200,message:`The Provider does not support the requested method: ${a}`});if(e&&e[n])return e[n]({baseRequest:t,params:o});if(t)return t({method:a,params:o});throw new r({code:4200,message:`The Provider does not support the requested method: ${a}`})};return s.request=i,s},d=s=>({method:e,params:t})=>new Promise((i,a)=>{s.sendAsync({id:0,jsonrpc:"2.0",method:e,params:t},(o,{result:n})=>{o?a(JSON.parse(o)):i(n??null)})}),f=`
@font-face {
  font-family: 'Inter';
  font-style:  normal;
  font-weight: 300 600;
  font-display: swap;
  src: url("https://rsms.me/inter/font-files/InterVariable.woff2") format("woff2-variations");
}
`;export{f as InterVar,r as ProviderRpcError,m as ProviderRpcErrorCode,u as bigIntToHex,w as chainIdToViemImport,p as chainIdValidation,g as chainNamespaceValidation,I as chainValidation,x as createDownloadMessage,c as createEIP1193Provider,y as ethToWeiBigInt,E as fromHex,T as isAddress,V as isHex,b as parseEther,H as toHex,q as validate,P as weiHexToEth,R as weiToEth};
