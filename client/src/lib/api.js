import axios from "axios";
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||"http://localhost:5000/api",timeout:20000});
export const getDashboard=()=>api.get("/dashboard").then(r=>r.data);
export const getScans=()=>api.get("/scans").then(r=>r.data);
export const getFindings=()=>api.get("/findings").then(r=>r.data);
export const createScan=data=>api.post("/scans",data).then(r=>r.data);
export const updateFinding=(id,status)=>api.patch("/findings/"+id+"/status",{status}).then(r=>r.data);
export const getHealth=()=>api.get("/health").then(r=>r.data);
