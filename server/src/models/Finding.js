import mongoose from "mongoose";
const schema=new mongoose.Schema({
 ownerId:{type:mongoose.Schema.Types.ObjectId,ref:"User",index:true},
 scanId:{type:mongoose.Schema.Types.ObjectId,ref:"Scan"},
 project:{type:String,required:true},packageName:{type:String,required:true},version:{type:String,default:"unknown"},
 ecosystem:{type:String,required:true},id:{type:String,default:""},title:{type:String,required:true},
 severity:{type:String,enum:["CRITICAL","HIGH","MEDIUM","LOW"],default:"LOW"},score:{type:Number,default:0},
 status:{type:String,enum:["open","in-progress","resolved"],default:"open"},fixedVersion:{type:String,default:""},
 summary:{type:String,default:""},recommendation:{type:String,default:""},line:{type:Number,default:null},evidence:{type:String,default:""},source:{type:String,default:"OSV"}
},{timestamps:true});
export default mongoose.model("Finding",schema);
