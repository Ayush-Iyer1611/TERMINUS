import {parseManifest} from "./manifestParser.js";
import {lookupOSV} from "./osv.js";
const weight={CRITICAL:8,HIGH:5,MEDIUM:3,LOW:1};
export async function scanManifest(input){
 const dependencies=parseManifest(input);
 if(dependencies.length>500)throw new Error("Maximum 500 dependencies per scan.");
 const findings=[];
 for(const dep of dependencies){
  let live=[];
  try{live=await lookupOSV(dep);}catch(error){console.warn("OSV lookup issue:",error.message);}
  if(live.length){findings.push(...live.map(item=>({...dep,...item,project:input.projectName,status:"open"})));continue;}

 }
 findings.sort((a,b)=>(weight[b.severity]||0)-(weight[a.severity]||0));
 const riskScore=Math.max(0,100-findings.reduce((n,f)=>n+(weight[f.severity]||0),0));
 return {dependencies,findings,riskScore};
}
