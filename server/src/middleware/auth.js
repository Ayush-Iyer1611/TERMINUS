import jwt from "jsonwebtoken";
export function requireAuth(req,res,next){
 const header=req.headers.authorization||"";
 const token=header.startsWith("Bearer ")?header.slice(7):"";
 if(!token)return res.status(401).json({message:"Sign in to continue."});
 try{req.user=jwt.verify(token,process.env.JWT_SECRET||"development-only-change-me");next();}
 catch{return res.status(401).json({message:"Session expired. Please sign in again."});}
}
