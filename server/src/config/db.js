import mongoose from "mongoose";
export async function connectDB(uri){
 if(!uri){console.log("MongoDB URI not set — starting in demo mode.");return false;}
 await mongoose.connect(uri);console.log("MongoDB connected.");return true;
}
