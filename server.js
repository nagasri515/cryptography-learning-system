const express=require("express");
const fs=require("fs");
const cors=require("cors");

const app=express();
app.use(express.json());
app.use(cors());

const FILE="data.json";
if(!fs.existsSync(FILE)) fs.writeFileSync(FILE,"[]");

function read(){return JSON.parse(fs.readFileSync(FILE));}
function write(d){fs.writeFileSync(FILE,JSON.stringify(d,null,2));}

app.post("/save",(req,res)=>{
let d=read();
let e={id:Date.now(),...req.body,time:new Date().toLocaleString()};
d.push(e);
write(d);
res.json(e);
});

app.get("/history",(req,res)=>res.json(read()));

app.delete("/history",(req,res)=>{
write([]);
res.json({msg:"cleared"});
});

app.listen(3000,()=>console.log("Server running"));