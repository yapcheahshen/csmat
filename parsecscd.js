const folder="./cscd-book/",outfolder="./raw/",outextrafolder="./raw/extra/";
const fs=require("fs");		
const Sax=require("sax");
const sets=['mul','att','tik','nrf'];
const allfiles=sets.map( s=>fs.readFileSync(s+".lst","utf8").split(/\r?\n/))
const tagstack=[];
let lasttext='';

let sid='';
const quotes=[];
const notes=[];
const outtext=[];
const pb=[];
let lastfn='';
let paragraph='';

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
		//quotes.push(lasttext);
	} else if (e.name=="note") {
		notes.push(sid+"|"+e.attributes.t); //todo: offset 
	} else if (e.name=="pb") {
		pb.push(sid+"|"+e.attributes.t);
	} else if (e.name=="p"){
		writeparagraph();
	}
}
const writeparagraph=()=>{
	paragraph=paragraph.replace(/ ?…pe…\.? ?/g,m=>" "+m+"\n");
	paragraph=paragraph.replace(/ hoti…\.? ?/g,m=>m+"\n");

	paragraph=paragraph.replace(/([\.?]) ([‘A-ZĀŪĪ])/g,(m,m1,m2)=>m1+"\n"+m2);

	const lines=paragraph.replace(/([–] ?)/g,(m,m1)=>m1+"\n").trim().split(/\n/);
	lines.forEach(l=>outtext.push(l));
	paragraph='';
}

/*
		parse (  ni. nnn.nn)
*/
const ontext=t=>{
	paragraph+=t;
}

const isnewbook=(fn)=>{
	if (!lastfn)return false;
	let at=fn.indexOf(".");
	fn=fn.substr(0,at);

	at=lastfn.indexOf(".");
	return lastfn.substr(0,at)!=fn;
}
const preprocess=content=>{
	content=content.replace(/ ?<pb ed="(\S+)" n="(\S+)" \/>/g,(m,ed,n)=>{
		return '<pb t="'+ed+n+'"/>';
	});
	content=content.replace(
		/<hi rend="paranum">(\S+)<\/hi><hi rend="dot">.<\/hi>/g,(m,m1)=>"{"+m1+"}");
	return content.replace(/ ?<note>(.+?)<\/note>/g,(m,m1)=> {
		let s=m1.replace(/"/g,'\\"');
		return '<note t="'+s+'"/>'
	});
}
const parsetei=(content,fn)=>{
	if (isnewbook(fn)){
		writeoutput();
	}
	let parser=Sax.parser(true);
	parser.onopentag=onopentag;
	parser.onclosetag=onclosetag;
	parser.ontext=ontext;
	parser.write(preprocess(content));
	writeparagraph();
}
const compress=lines=>{
	return lines;
}
const writeoutput=()=>{
	let fn=lastfn.replace(/\.\S+\.xml/,'');
	const lines=compress(outtext);
	fs.writeFileSync(outfolder+fn+".txt",lines.join("\n"),'utf8');
	fs.writeFileSync(outextrafolder+fn+"-pb.txt",pb.join("\n"),"utf8");
	fs.writeFileSync(outextrafolder+fn+"-notes.txt",notes.join("\n"),"utf8");

	outtext.length=0;
	notes.length=0;
	pb.length=0;
}
const dofiles=files=>{
	files=files.filter(f=>f.indexOf("s01")==0);
	const max=4||files.length;
	for (let i=0;i<max;i++) {
		const fn=files[i]
		const content=fs.readFileSync(folder+fn,'utf8');
		process.stdout.write("\r"+fn);
		parsetei(content, fn);
		lastfn=fn;
	}
}

allfiles.forEach( files=>dofiles(files));
writeoutput();
