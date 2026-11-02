import {Router} from "express";
import mongoose from "mongoose";
import Scan from "../models/Scan.js";
import Finding from "../models/Finding.js";
import {scanManifest} from "../services/scanner.js";
const router=Router();
let demoScans=[
 {_id:"demo-scan-1",projectName:"terminus-web",ecosystem:"npm",status:"completed",findingCount:12,createdAt:new Date().toISOString()},
 {_id:"demo-scan-2",projectName:"analytics-service",ecosystem:"PyPI",status:"completed",findingCount:8,createdAt:new Date(Date.now()-86400000).toISOString()},
 {_id:"demo-scan-3",projectName:"api-gateway",ecosystem:"npm",status:"completed",findingCount:17,createdAt:new Date(Date.now()-172800000).toISOString()}
];
let demoFindings=[
 {_id:"demo-1",packageName:"lodash",version:"4.17.20",ecosystem:"npm",id:"DEMO-OSV-001",title:"Prototype pollution in lodash",severity:"CRITICAL",score:9.8,status:"open",project:"terminus-web",fixedVersion:"4.17.21",summary:"Demo advisory for interface review. Confirm the affected range with OSV.",source:"DEMO SAMPLE"},
 {_id:"demo-2",packageName:"axios",version:"0.21.1",ecosystem:"npm",id:"DEMO-OSV-002",title:"Known axios security advisory",severity:"HIGH",score:8.1,status:"open",project:"api-gateway",fixedVersion:"1.6.0",summary:"Demo advisory. Confirm affected version information against the upstream record.",source:"DEMO SAMPLE"},
 {_id:"demo-3",packageName:"Django",version:"3.2.10",ecosystem:"PyPI",id:"CVE-2022-28346",title:"Django security advisory",severity:"HIGH",score:7.5,status:"in-progress",project:"analytics-service",fixedVersion:"3.2.13",summary:"Demo advisory. Validate the version range and supported upgrade path.",source:"DEMO SAMPLE"},
 {_id:"demo-4",packageName:"urllib3",version:"1.26.5",ecosystem:"PyPI",id:"CVE-2021-33503",title:"urllib3 CRLF injection advisory",severity:"MEDIUM",score:6.1,status:"open",project:"analytics-service",fixedVersion:"1.26.6",summary:"Demo advisory. Confirm upstream affected and fixed versions.",source:"DEMO SAMPLE"},
 {_id:"demo-5",packageName:"minimist",version:"1.2.5",ecosystem:"npm",id:"DEMO-OSV-003",title:"Prototype pollution in minimist",severity:"MEDIUM",score:5.6,status:"resolved",project:"terminus-web",fixedVersion:"1.2.6",summary:"Sample record for the interface. Verify with a live source.",source:"DEMO SAMPLE"}
];
const dbReady=()=>mongoose.connection.readyState===1;
router.get("/health",(_req,res)=>res.json({ok:true,service:"terminus-api",database:dbReady()?"connected":"demo-mode",timestamp:new Date().toISOString()}));
router.get("/dashboard",async(_req,res,next)=>{try{
 const scans=dbReady()?await Scan.find().sort({createdAt:-1}).limit(100).lean():demoScans;
 const findings=dbReady()?await Finding.find().lean():demoFindings;
 const open=findings.filter(f=>f.status!=="resolved");
 const metrics={projects:new Set(scans.map(s=>s.projectName)).size,scans:scans.length,findings:open.length,critical:open.filter(f=>f.severity==="CRITICAL").length,high:open.filter(f=>f.severity==="HIGH").length,medium:open.filter(f=>f.severity==="MEDIUM").length,low:open.filter(f=>f.severity==="LOW").length,riskScore:Math.max(0,100-open.reduce((n,f)=>n+({CRITICAL:8,HIGH:5,MEDIUM:3,LOW:1}[f.severity]||0),0))};
 res.json({metrics,recentScans:scans.slice(0,8)});
 }catch(e){next(e)}});
router.get("/scans",async(_req,res,next)=>{try{const scans=dbReady()?await Scan.find().sort({createdAt:-1}).limit(100).lean():demoScans;res.json({scans});}catch(e){next(e)}});
router.get("/scans/:id",async(req,res,next)=>{try{const scan=dbReady()?await Scan.findById(req.params.id).lean():demoScans.find(s=>s._id===req.params.id);if(!scan)return res.status(404).json({message:"Scan not found"});const findings=dbReady()?await Finding.find({scanId:scan._id}).lean():demoFindings.filter(f=>f.project===scan.projectName);res.json({scan,findings});}catch(e){next(e)}});
router.post("/scans",async(req,res,next)=>{try{
 const {projectName,ecosystem,fileName,manifest}=req.body||{};
 if(!projectName||!["npm","PyPI"].includes(ecosystem)||!manifest)return res.status(400).json({message:"Project name, supported ecosystem, and manifest are required."});
 const result=await scanManifest({projectName,ecosystem,fileName,manifest});
 const record={projectName,ecosystem,fileName,status:"completed",dependencyCount:result.dependencies.length,findingCount:result.findings.length,riskScore:result.riskScore};
 if(dbReady()){
  const scan=await Scan.create(record);const findings=result.findings.map(f=>({...f,scanId:scan._id}));
  if(findings.length)await Finding.insertMany(findings);
  return res.status(201).json({scan,dependencies:result.dependencies,findings,findingCount:findings.length,riskScore:result.riskScore});
 }
 const scan={_id:"scan-"+Date.now(),...record,createdAt:new Date().toISOString()};
 demoScans=[scan,...demoScans].slice(0,100);
 const added=result.findings.map((f,i)=>({_id:"finding-"+Date.now()+"-"+i,...f}));
 demoFindings=[...added,...demoFindings].slice(0,500);
 res.status(201).json({scan,dependencies:result.dependencies,findings:added,findingCount:added.length,riskScore:result.riskScore});
 }catch(e){if(["Manifest","Invalid JSON","Supported formats","Maximum"].some(s=>e.message.includes(s)))return res.status(400).json({message:e.message});next(e)}});
router.get("/findings",async(req,res,next)=>{try{
 const query={};if(req.query.severity)query.severity=String(req.query.severity).toUpperCase();if(req.query.status)query.status=String(req.query.status);
 const findings=dbReady()?await Finding.find(query).sort({score:-1}).limit(500).lean():demoFindings.filter(f=>(!query.severity||f.severity===query.severity)&&(!query.status||f.status===query.status));
 res.json({findings});
 }catch(e){next(e)}});
router.patch("/findings/:id/status",async(req,res,next)=>{try{
 const status=req.body?.status;if(!["open","in-progress","resolved"].includes(status))return res.status(400).json({message:"Invalid workflow status."});
 if(dbReady()){const finding=await Finding.findByIdAndUpdate(req.params.id,{status},{new:true});if(!finding)return res.status(404).json({message:"Finding not found."});return res.json({finding});}
 const i=demoFindings.findIndex(f=>f._id===req.params.id);if(i<0)return res.status(404).json({message:"Finding not found."});
 demoFindings[i]={...demoFindings[i],status};res.json({finding:demoFindings[i]});
 }catch(e){next(e)}});
export default router;
