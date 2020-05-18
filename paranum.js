/* print paranum of a set*/
const fs=require("fs");
const {dofiles,getfiles}=require("./dofile");
const set=process.argv[2] || "*"
const maxfile=parseInt(process.argv[3],0);
const files=getfiles("./raw/");

const farr=files[set];
const output=[];
const {expandrange}=require("./paliutil")
dofiles(farr,(content,fn)=>{
	const lines=content.split(/\n/);
	let lastpn=0,group='',pncount=0;
	lines.forEach( (line,idx)=>{
		const m=line.match(/ pn="(.+?)"/i);
		if (!m)return;
		let range=m[1].split("-");

		const pn=parseInt(range[0]);
		let to=parseInt(range[1]);
		to=expandrange(pn,to);

		if (pn>lastpn && lastpn) {
			pncount++;
		} else { //new group

			if (pncount) group+="-"+lastpn+",";
			else group+=",";

			if (pn!=1) group+="^"
			group += pn;
			pncount=0
		}

	
		lastpn=to;
	});
	group+="-"+lastpn;
	output.push(fn.replace('.xml','')+"("+(lines.length-2)+") "+ group );
})
fs.writeFileSync("paranum.txt",output.join("\n"),"utf8");