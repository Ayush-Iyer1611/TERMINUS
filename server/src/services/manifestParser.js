export function parseManifest({ecosystem,fileName,manifest}){
 if(typeof manifest!=="string"||manifest.length>300000)throw new Error("Manifest must be text under 300 KB.");
 const name=(fileName||"").toLowerCase();
 if(ecosystem==="npm"||name.endsWith(".json")){
  let data;try{data=JSON.parse(manifest);}catch{throw new Error("Invalid JSON dependency manifest.");}
  const deps={...(data.dependencies||{}),...(data.devDependencies||{}),...(data.optionalDependencies||{})};
  return Object.entries(deps).map(([packageName,version])=>({packageName,version:String(version).replace(/^[^0-9]*/,"")||"unknown",ecosystem:"npm"}));
 }
 if(ecosystem==="PyPI"||name.endsWith(".txt")){
  return manifest.split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!line.startsWith("#")&&!line.startsWith("-")).map(line=>{
   const match=line.match(/^([A-Za-z0-9_.-]+)\s*(?:==|===|~=|>=|<=|>|<)\s*([A-Za-z0-9_.+!-]+)/);
   return match?{packageName:match[1],version:match[2],ecosystem:"PyPI"}:null;
  }).filter(Boolean);
 }
 throw new Error("Supported formats: npm package.json and Python requirements.txt.");
}
