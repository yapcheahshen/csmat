const folder="./cscd/"
const fs=require("fs");		
const Sax=require("sax");
const sets=['mul','att','tik','nrf'];
const allfiles=sets.map( s=>fs.readFileSync(s+".lst","utf8").split(/\r?\n/))
const tagstack=[];
let lasttext='';
const quotes=[];
const notes=[];
let currenttagname='';
let maxtagstack=0;
const onopentag=e=>{
	tagstack.push(e);
	currenttagname=e.name;
	if (tagstack.length>maxtagstack)maxtagstack=tagstack.length;
}
const onclosetag=tag=>{
	const e=tagstack.pop();
	if (e.name=="hi" && e.attributes.rend=="bold") {
		quotes.push(lasttext);
	} else if (e.name=="note") {
		notes.push(lasttext);
	}

}
const ontext=t=>{
	lasttext=t;
}

const parsetei=(content,fn)=>{
	let parser=Sax.parser(true);
	parser.onopentag=onopentag;
	parser.onclosetag=onclosetag;
	parser.ontext=ontext;
	parser.write(content);
}


const dofiles=files=>{
	//files=files.filter(f=>f.indexOf("s05")==0);
	for (let i=1;i<files.length;i++) {
		const fn=files[i]
		const content=fs.readFileSync(fn,'utf8');
		process.stdout.write("\r"+fn);
		parsetei(content, fn);
	}
}

allfiles.forEach( files=>dofiles(files));
fs.writeFileSync("quotes.txt",quotes.join("\n"),"utf8");
fs.writeFileSync("notes.txt",notes.join("\n"),"utf8");