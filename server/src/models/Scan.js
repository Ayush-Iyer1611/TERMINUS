import mongoose from "mongoose";
const schema=new mongoose.Schema({
 projectName:{type:String,required:true,trim:true,maxlength:100},
 ecosystem:{type:String,enum:["npm","PyPI","source"],required:true},
 fileName:{type:String,default:"manifest"},
 status:{type:String,enum:["queued","running","completed","failed"],default:"completed"},
 dependencyCount:{type:Number,default:0},findingCount:{type:Number,default:0},riskScore:{type:Number,default:100},
 createdAt:{type:Date,default:Date.now}
},{timestamps:true});
export default mongoose.model("Scan",schema);
