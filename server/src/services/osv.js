function scoreFromAdvisory(v){
 const severity=(v.database_specific?.severity||"").toUpperCase();
 const scoreText=(v.severity||[]).find(s=>s.type?.startsWith("CVSS"))?.score||"";
 const score=Number(scoreText.match(/[0-9]+(?:\.[0-9]+)?/)?.[0]||0);
 const level=["CRITICAL","HIGH","MEDIUM","LOW"].includes(severity)?severity:score>=9?"CRITICAL":score>=7?"HIGH":score>=4?"MEDIUM":"LOW";
 return {severity:level,score};
}
export async function lookupOSV(dep){
 if(process.env.ENABLE_LIVE_OSV!=="true")return [];
 const endpoint=process.env.OSV_API_URL||"https://api.osv.dev/v1/query";
 const response=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({package:{name:dep.packageName,ecosystem:dep.ecosystem},version:dep.version}),signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw new Error("OSV lookup failed with status "+response.status);
 const data=await response.json();
 return (data.vulns||[]).map(v=>{
  const info=scoreFromAdvisory(v);
  const affected=(v.affected||[]).find(a=>a.package?.name?.toLowerCase()===dep.packageName.toLowerCase());
  const fixed=(affected?.ranges||[]).flatMap(r=>r.events||[]).find(e=>e.fixed)?.fixed||"";
  return {...info,id:v.id,title:v.summary||v.id,summary:(v.details||v.summary||"Review upstream advisory details.").slice(0,1200),fixedVersion:fixed,source:"OSV"};
 });
}
