const fs=require("fs");
const {dofiles,files}=require("./dofile");
const f=files.nrf;//.filter(fn=>fn.substr(0,3)=="s01");
const links=[];
dofiles(f,(content,fn)=>{
	content.replace(/\((.+?)\)/g,(m,m1)=>{
		if (m1.indexOf(" ")==-1) return;
		if (!m1.match(/\d/))return;
		if (m1.match(/</))return;
		m1.split(";").forEach(i=>links.push(i));
	});
});
links.sort();
fs.writeFileSync("nrf-links.txt",links.join("\n"),"utf8")