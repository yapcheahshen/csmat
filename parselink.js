const fs=require("fs");
let multag=fs.readFileSync("mul-rawtag.txt","utf8").split(/\r?\n/);
let atttag=fs.readFileSync("att-rawtag.txt","utf8").split(/\r?\n/);
let tiktag=fs.readFileSync("tik-rawtag.txt","utf8").split(/\r?\n/);



const mulnote=multag.filter(item=>item.indexOf("note ")>-1);
const attnote=atttag.filter(item=>item.indexOf("note ")>-1);
const tiknote=tiktag.filter(item=>item.indexOf("note ")>-1);
const {recognise,linkpatterns}=require("./linkparser");
const links=[];
const translatelink=[]
const unregconized=[];
const patstat=[];
const parsefail=[];
const parsedlinks=[];
let recognized=0;

const {humanlink}=require("./mataddr");
const listpat=(lines,set)=>{
	for (var i=0;i<lines.length;i++){
		let line=lines[i];
		const at=line.indexOf(",");
		mataddr=parseInt('0x'+line.substr(0,at));
		
		linkpatterns.forEach(pat=>{
			line=line.replace(pat,m=>{
				let translated=recognise([m,mataddr]);
				if (translated) {
					if (typeof translated=="string"){
						parsedlinks.push(translated+"<="+set+"@"+mataddr.toString(16));
						translatelink.push([mataddr,translated]);
						recognized++;
					} else {
						if (translated) parsefail.push([m,humanlink(set,mataddr)]);
					}
				} else {
					unregconized.push([m,mataddr]);
				}
				links.push([m,mataddr]);
				return "";
			});
		});		
	}

};


console.log("extract links from rawtag")
listpat(mulnote,'mul');
listpat(attnote,'att');
listpat(tiknote,'tik');
links.sort();
console.log("number of links",links.length)

fs.writeFileSync("all-links.txt",links.join("\n"),"utf8")
fs.writeFileSync("tra-links.txt",translatelink.join("\n"),"utf8")
fs.writeFileSync("unregconized.txt",unregconized.join("\n"),"utf8")
console.log("recognized",recognized, (recognized*100/links.length).toFixed(2)+"%fail",parsefail.length);

fs.writeFileSync("link-parsefail.txt",parsefail.join("\n"),"utf8")
fs.writeFileSync("link-parsed.txt",parsedlinks.join("\n"),"utf8");
//const stat=patstat.map((count,idx)=>[count,pattern[idx][0]]);
//stat.sort((a,b)=>b[0]-a[0]);
//fs.writeFileSync("link-freqpat.txt",stat.join("\n"),"utf8")