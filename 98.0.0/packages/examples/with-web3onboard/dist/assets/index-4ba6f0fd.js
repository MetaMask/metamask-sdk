import{ay as m,b2 as h,b3 as w,b5 as p,b4 as b,b1 as y,b0 as g}from"./index-260e3e09.js";class r extends Error{constructor(e){super(e.message),this.message=e.message,this.code=e.code,this.data=e.data}}const c=(s,e)=>{let n;s.request?n=s.request.bind(s):s.sendAsync&&(n=d(s));const i=async({method:t,params:a})=>{const o=t;if(e&&e[o]===null)throw new r({code:4200,message:`The Provider does not support the requested method: ${t}`});if(e&&e[o])return e[o]({baseRequest:n,params:a});if(n)return n({method:t,params:a});throw new r({code:4200,message:`The Provider does not support the requested method: ${t}`})};return s.request=i,s},d=s=>({method:e,params:n})=>new Promise((i,t)=>{s.sendAsync({id:0,jsonrpc:"2.0",method:e,params:n},(a,{result:o})=>{a?t(JSON.parse(a)):i(o??null)})}),f=`
@font-face {
  font-family: 'Inter';
  font-style:  normal;
  font-weight: 300 600;
  font-display: swap;
  src: url("https://rsms.me/inter/font-files/Inter-roman.var.woff2?v=3.19") format("woff2");
}
`;export{f as InterVar,r as ProviderRpcError,m as ProviderRpcErrorCode,h as chainIdValidation,w as chainNamespaceValidation,p as chainValidation,c as createEIP1193Provider,b as providerConnectionInfoValidation,y as validate,g as weiToEth};
