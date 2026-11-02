import {Router} from "express";
import mongoose from "mongoose";
import Scan from "../models/Scan.js";
import Finding from "../models/Finding.js";
import {scanManifest} from "../services/scanner.js";
import {requireAuth} from "../middleware/auth.js";
const router=Router();
let demoScans=[];
let demoFindings=[];
const dbReady=()=>mongoose.connection.readyState===1;
router.get("/health",(_req,res)=>res.json({ok:true,service:"terminus-api",database:dbReady()?"connected":"demo-mode",ai:!!process.env.OPENAI_API_KEY,timestamp:new Date().toISOString()}));
router.use(requireAuth);
router.get("/dashboard",async(_req,res,next)=>{try{
 const scans=dbReady()?await Scan.find({ownerId:req.user.sub}).sort({createdAt:-1}).limit(100).lean():demoScans;
 const findings=dbReady()?await Finding.find({ownerId:req.user.sub}).lean():demoFindings;
 const open=findings.filter(f=>f.status!=="resolved");
 const metrics={projects:new Set(scans.map(s=>s.projectName)).size,scans:scans.length,findings:open.length,critical:open.filter(f=>f.severity==="CRITICAL").length,high:open.filter(f=>f.severity==="HIGH").length,medium:open.filter(f=>f.severity==="MEDIUM").length,low:open.filter(f=>f.severity==="LOW").length,riskScore:open.length?Math.max(0,100-open.reduce((n,f)=>n+({CRITICAL:8,HIGH:5,MEDIUM:3,LOW:1}[f.severity]||0),0)):null};
 res.json({metrics,recentScans:scans.slice(0,8)});
 }catch(e){next(e)}});
router.get("/scans",async(_req,res,next)=>{try{const scans=dbReady()?await Scan.find().sort({createdAt:-1}).limit(100).lean():demoScans.filter(s=>s.ownerId===req.user.sub);res.json({scans});}catch(e){next(e)}});
router.get("/scans/:id",async(req,res,next)=>{try{const scan=dbReady()?await Scan.findOne({_id:req.params.id,ownerId:req.user.sub}).lean():demoScans.find(s=>s._id===req.params.id&&s.ownerId===req.user.sub);if(!scan)return res.status(404).json({message:"Scan not found"});const findings=dbReady()?await Finding.find({scanId:scan._id,ownerId:req.user.sub}).lean():demoFindings.filter(f=>f.project===scan.projectName&&f.ownerId===req.user.sub);res.json({scan,findings});}catch(e){next(e)}});
router.post("/scans",async(req,res,next)=>{try{
 const {projectName,ecosystem,fileName,manifest}=req.body||{};
 if(!projectName||!["npm","PyPI"].includes(ecosystem)||!manifest)return res.status(400).json({message:"Project name, supported ecosystem, and manifest are required."});
 const result=await scanManifest({projectName,ecosystem,fileName,manifest});
 const record={ownerId:req.user.sub,projectName,ecosystem,fileName,status:"completed",dependencyCount:result.dependencies.length,findingCount:result.findings.length,riskScore:result.riskScore};
 if(dbReady()){
  const scan=await Scan.create(record);const findings=result.findings.map(f=>({...f,scanId:scan._id,ownerId:req.user.sub}));
  if(findings.length)await Finding.insertMany(findings);
  return res.status(201).json({scan,dependencies:result.dependencies,findings,findingCount:findings.length,riskScore:result.riskScore});
 }
 const scan={_id:"scan-"+Date.now(),...record,createdAt:new Date().toISOString()};
 demoScans=[scan,...demoScans].slice(0,100);
 const added=result.findings.map((f,i)=>({_id:"finding-"+Date.now()+"-"+i,...f}));
 demoFindings=[...added.map(f=>({...f,ownerId:req.user.sub})),...demoFindings].slice(0,500);
 res.status(201).json({scan,dependencies:result.dependencies,findings:added,findingCount:added.length,riskScore:result.riskScore});
 }catch(e){if(["Manifest","Invalid JSON","Supported formats","Maximum"].some(s=>e.message.includes(s)))return res.status(400).json({message:e.message});next(e)}});
router.get("/findings",async(req,res,next)=>{try{
 const query={};if(req.query.severity)query.severity=String(req.query.severity).toUpperCase();if(req.query.status)query.status=String(req.query.status);
 const findings=dbReady()?await Finding.find({...query,ownerId:req.user.sub}).sort({score:-1}).limit(500).lean():demoFindings.filter(f=>f.ownerId===req.user.sub&&(!query.severity||f.severity===query.severity)&&(!query.status||f.status===query.status));
 res.json({findings});
 }catch(e){next(e)}});
router.patch("/findings/:id/status",async(req,res,next)=>{try{
 const status=req.body?.status;if(!["open","in-progress","resolved"].includes(status))return res.status(400).json({message:"Invalid workflow status."});
 if(dbReady()){const finding=await Finding.findOneAndUpdate({_id:req.params.id,ownerId:req.user.sub},{status},{new:true});if(!finding)return res.status(404).json({message:"Finding not found."});return res.json({finding});}
 const i=demoFindings.findIndex(f=>f._id===req.params.id&&f.ownerId===req.user.sub);if(i<0)return res.status(404).json({message:"Finding not found."});
 demoFindings[i]={...demoFindings[i],status};res.json({finding:demoFindings[i]});
 }catch(e){next(e)}});
export default router;
