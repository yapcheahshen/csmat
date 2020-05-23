const fs=require("fs");

let multag=fs.readFileSync("mul-rawtag.txt","utf8").split(/\r?\n/);
let atttag=fs.readFileSync("att-rawtag.txt","utf8").split(/\r?\n/);
let tiktag=fs.readFileSync("tik-rawtag.txt","utf8").split(/\r?\n/);

mulnote=multag.filter(item=>item.indexOf("note ")>-1).join("\n");
attnote=atttag.filter(item=>item.indexOf("note ")>-1).join("\n");
tiknote=tiktag.filter(item=>item.indexOf("note ")>-1).join("\n");
const patterns=[
	/[āūḷṭīa-z\.]+ [āūḷṭīa-z\.]+ ṭī\. [\-\d\.]+/gi,
	/[āūḷṭīa-z\.]+ [āūḷṭīa-z\.]+ aṭṭha\. [\-\d\.]+/gi,
	/[āūḷṭīa-z\.]+ [a-z][āa]\. [\-\d\.]+/gi,
	/[āūḷṃīa-z\.]+ ?ni\. aṭṭha\. [\-\d\.]+/gi,
	/[āūḷṃīa-z\.]+ ?ni\. [\-\d\.]+/gi,
	/[āūḷṃṭīa-z\.]+ [\-\d\.]+/gi,
]
const links=[];
const listpat=content=>{
	patterns.forEach(pat=>{
		content.replace(pat,m=>{
			links.push(m);
			return "";
		});
	});
};
listpat(mulnote);
listpat(attnote);
listpat(tiknote);

fs.writeFileSync("all-links.txt",links.join("\n"),"utf8")