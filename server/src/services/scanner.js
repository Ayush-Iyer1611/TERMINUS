import {parseManifest} from "./manifestParser.js";
import {lookupOSV} from "./osv.js";
const demo={
 "lodash@4.17.20":{id:"DEMO-OSV-001",title:"Prototype pollution in lodash",severity:"CRITICAL",score:9.8,fixedVersion:"4.17.21",summary:"Demo advisory: this version is used to demonstrate a prototype pollution finding. Verify affected ranges with OSV before acting."},
 "axios@0.21.1":{id:"DEMO-OSV-002",title:"Known axios security advisory",severity:"HIGH",score:8.1,fixedVersion:"1.6.0",summary:"Demo advisory: review the upstream affected-version range and upgrade to a supported patched version."},
 "django@3.2.10":{id:"CVE-2022-28346",title:"Django security advisory",severity:"HIGH",score:7.5,fixedVersion:"3.2.13",summary:"Demo advisory: inspect the CVE and confirm the relevant Django affected range."},
 "urllib3@1.26.5":{id:"CVE-2021-33503",title:"urllib3 CRLF injection advisory",severity:"MEDIUM",score:6.1,fixedVersion:"1.26.6",summary:"Demo advisory: verify affected versions and patched releases with the upstream database."}
};
const weight={CRITICAL:8,HIGH:5,MEDIUM:3,LOW:1};
export async function scanManifest(input){
 const dependencies=parseManifest(input);
 if(dependencies.length>500)throw new Error("Maximum 500 dependencies per scan.");
 const findings=[];
 for(const dep of dependencies){
  let live=[];
  try{live=await lookupOSV(dep);}catch(error){console.warn("OSV lookup issue:",error.message);}
  if(live.length){findings.push(...live.map(item=>({...dep,...item,project:input.projectName,status:"open"})));continue;}
  const sample=demo[dep.packageName.toLowerCase()+"@"+dep.version];
  if(sample)findings.push({...dep,...sample,project:input.projectName,status:"open",source:"DEMO SAMPLE — validate upstream"});
 }
 findings.sort((a,b)=>(weight[b.severity]||0)-(weight[a.severity]||0));
 const riskScore=Math.max(0,100-findings.reduce((n,f)=>n+(weight[f.severity]||0),0));
 return {dependencies,findings,riskScore};
}
