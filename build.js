const fs=require("fs");
const {build,writeExtra}=require("dengine");
const set=process.argv[2] || "mul"
const maxfile=parseInt(process.argv[3],0);

let rawfn=set+"-raw.txt"
const raw=fs.readFileSync(rawfn,"utf8").split(/\r?\n/);

const paras=fs.readFileSync(set+"-paranum.txt","utf8").split(/\r?\n/);
let paranum='[';
paras.forEach((item,idx)=>{
	if (idx)paranum+=','
	paranum+='['+item+']';
});
paranum+=']';

const bookname=fs.readFileSync(set+"-bookname.txt","utf8");

const aux={paranum,bookname}; // if eval(paranum), empty item will fill with null

build({name:set,outdir:set+"/", textonly:true, 
	continuouspage:true,aux, 
	fields:["txt"] },raw);