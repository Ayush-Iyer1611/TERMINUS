import {Router} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {requireAuth} from "../middleware/auth.js";
const router=Router();
const ephemeralUsers=new Map();
const secret=()=>process.env.JWT_SECRET||"development-only-change-me";
const issue=user=>jwt.sign({sub:String(user._id),email:user.email,name:user.name},secret(),{expiresIn:"12h"});
router.post("/register",async(req,res,next)=>{try{
 const name=String(req.body?.name||"").trim(),email=String(req.body?.email||"").trim().toLowerCase(),password=String(req.body?.password||"");
 if(name.length<2||name.length>80||!/^\S+@\S+\.\S+$/.test(email)||password.length<10)return res.status(400).json({message:"Enter a valid name and email. Password must be at least 10 characters."});
 if(process.env.MONGODB_URI){if(await User.findOne({email}))return res.status(409).json({message:"An account with this email already exists."});}
 else if(ephemeralUsers.has(email))return res.status(409).json({message:"An account with this email already exists."});
 const passwordHash=await bcrypt.hash(password,12);
 const user=process.env.MONGODB_URI?await User.create({name,email,passwordHash}):{_id:"local-"+Date.now(),name,email,passwordHash};
 if(!process.env.MONGODB_URI)ephemeralUsers.set(email,user);
 res.status(201).json({token:issue(user),user:{id:user._id,name:user.name,email:user.email}});
 }catch(e){next(e)}});
router.post("/login",async(req,res,next)=>{try{
 const email=String(req.body?.email||"").trim().toLowerCase(),password=String(req.body?.password||"");
 const user=process.env.MONGODB_URI?await User.findOne({email}):ephemeralUsers.get(email);
 if(!user||!await bcrypt.compare(password,user.passwordHash))return res.status(401).json({message:"Email or password is incorrect."});
 res.json({token:issue(user),user:{id:user._id,name:user.name,email:user.email}});
 }catch(e){next(e)}});
router.get("/me",requireAuth,async(req,res,next)=>{try{const UserModel=(await import("../models/User.js")).default;const user=process.env.MONGODB_URI?await UserModel.findById(req.user.sub).select("name email").lean():[...ephemeralUsers.values()].find(u=>String(u._id)===String(req.user.sub));if(!user)return res.status(401).json({message:"Account not found."});res.json({user:{id:req.user.sub,name:user.name,email:user.email}});}catch(e){next(e)}});
export default router;
