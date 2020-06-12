'use stricts';
const fs=require("fs");
const {createbuilder,writeExtra}=require("dengine");
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

//const bookname=fs.readFileSync(set+"-bookname.txt","utf8");
const matlinks=JSON.parse(fs.readFileSync(set+"-matlinks.txt","utf8"));
const ptsvolpg=JSON.parse(fs.readFileSync(set+"-pts.txt","utf8"))
const aux={paranum,matlinks,ptsvolpg}; // if eval(paranum), empty item will fill with null

build=()=>{
	let prevbk='',prevparanum=0,name=set;

	const builder=createbuilder({name,withtoc:true});
	for (var i=0;i<raw.length;i++) {
		const rawline=raw[i];
		const at=rawline.indexOf(",");
		const bklinenum=rawline.substr(0,at);
		const bkat=bklinenum.indexOf(":");
		if (bkat>0) {
			bk=bklinenum.substr(0,bkat);
			builder.addpage(prevparanum);
			prevbk&&builder.addbook(prevbk);
			prevbk=bk;
			debugger
			prevparanum=0;
		}

		const content=rawline.substr(at+1);
		
		const at2=content.indexOf("|");
		if (at2>-1) {
			const paranum=parseInt(content);
			if (paranum) {
				builder.addpage(prevparanum);
				prevparanum=paranum;
			}
		}

		builder.addline(content);

	}
	builder.addpage(prevparanum);
	builder.addbook(prevbk);

	const payload=[];
	builder.done(payload,{matlinks,ptsvolpg});

}
build();
const toc=fs.readFileSync(set+"-rawtoc.txt","utf8");
writeExtra(set+"/"+set+".toc-ori.js",{"name":set,"type":"toc","field":["txt"]},toc);