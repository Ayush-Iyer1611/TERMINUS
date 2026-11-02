import {Router} from "express";
import {analyzeSource,analyzeWithAI} from "../services/codeAnalyzer.js";
const router=Router();
router.post("/analyze",async(req,res,next)=>{try{
 const fileName=String(req.body?.fileName||"");const sourceCode=req.body?.sourceCode;
 const staticFindings=analyzeSource({fileName,sourceCode});
 let result;
 try{result=await analyzeWithAI({fileName,sourceCode,staticFindings});}
 catch(error){return res.status(502).json({message:error.message,staticFallback:{mode:"static",findings:staticFindings,summary:"AI analysis was unavailable. Showing local static checks instead."}});}
 res.json({...result,fileName,findings:result.findings,counts:{total:result.findings.length,critical:result.findings.filter(f=>f.severity==="CRITICAL").length,high:result.findings.filter(f=>f.severity==="HIGH").length,medium:result.findings.filter(f=>f.severity==="MEDIUM").length,low:result.findings.filter(f=>f.severity==="LOW").length}});
 }catch(e){if(e.message.startsWith("Unsupported")||e.message.startsWith("The uploaded")||e.message.startsWith("Maximum"))return res.status(400).json({message:e.message});next(e)}});
export default router;
