const fs=require("fs");
const {dofiles,getfiles}=require("./dofile");
const set=process.argv[2] || "mul"
const maxfile=parseInt(process.argv[3],0);
const files=getfiles("./raw/");
const {isSyllable,syllabify,isPaliword,palialpha}=require("./paliutil");

let bookseq=0;
const output=[];
const rawtags=[];
const tocoutput=[];
const matpara=[];
const MAXDOC=1<<16; //<p> is a doc
const MAXSYL =1<<12;
let filename='',sourcelinenumber=0;
const TocEle={nikaya:1,book:2,chapter:3,title:4,subhead:5,subsubhead:6}
const isToc=rend=>{
	return TocEle[rend];
}
const mataddr=(nbook=0,ndoc=1,nsyl=0)=>{ 
	if (ndoc>=MAXDOC)throw ndoc+" doc exceed limit " +filename+" "+sourcelinenumber;
	if (nsyl>=MAXSYL)throw nsyl+" syllabus exceed limit " +filename+" "+sourcelinenumber;
	return nsyl+ndoc*(1<<12)+nbook*(1<<28);
}
const unpackmataddr=addr=>{
	const syl=addr % (MAXSYL-1);
	addr=addr>>12;
	const doc = addr % (MAXDOC-1);
	const book= addr>>16;
	return [book,doc,syl];
}

const parseInlineTag=(tagstr)=>{
	let savetag=true;
	if (tagstr.substr(0,4)=="<pb ") {
		
	} else if (tagstr.substr(0,6)=="<note ") {
		//todo parse note links
	} else if (tagstr.substr(0,6)=="<gbrk/") {
		savetag=false;
	} else {
		savetag=false;
		console.log("unknown tag",tagstr,filename,sourcelinenumber+1);
	}
	return savetag;
}
const {expandrange}=require("./paliutil")
const repeatnum={};
const parseP=(attrs,docseq,linetext)=>{
	let extra='';
	const a=mataddr(bookseq,docseq);
	attrs.forEach(attr=>{
		if (attr[attr.length-1]=='"') {
			attr=attr.slice(0,attr.length-1);
		}
		const m=attr.match(/(\S+?)="(.+)/);
		if (m[1]=="rend") {
			if (isToc(m[2])) {
				const purelinetext=linetext.replace(/<[^<]+?>/,"");
				tocoutput.push([a.toString(16),m[2]+"|"+purelinetext])
			}
			extra=m[2];
		} else if (m[1]=='pn' || m[1]=='PN') {
			//check continuity , pack as array of book+docseq
			if (!matpara[bookseq])matpara[bookseq]=[0];
			const arr=matpara[bookseq];
			const range=m[2].split("-");
			if (range.length==1) {
				let at=parseInt(range[0]);
				if (arr[at]) {
					if (!repeatnum[filename])repeatnum[filename]=[];
					repeatnum[filename].push(sourcelinenumber);
				}
				arr[at] = docseq;
			} else {
				const from=parseInt(range[0]);
				let to=parseInt(range[1]);
				to=expandrange(from,to);
				if (to<from) {
					console.log("para range error",range,filename,sourcelinenumber+1);
				}

				arr[from]=docseq;
				// search backward if item is null
				arr[to]=docseq;
				/*
				for (let ii=from;ii<=to;ii++) {
					if (arr[ii]) {
						if (!repeatnum[filename])repeatnum[filename]=[];
						repeatnum[filename].push(sourcelinenumber);
					}
					arr[ii]=docseq;
				}
				*/
			}
		} else {
			console.log("unknown p attributes ",m[1],filename,sourcelinenumber);
		}
	})
	return extra;
}
const parseLine=(line,docseq)=>{
	let units=line.split(/(<.+?>)/);
	let l='';
	let nsyl=0; //syllable pointer
	for (var i=0;i<units.length;i++){
		unit=units[i];
		if (unit[0]=="<") {
			const a=mataddr(bookseq,docseq,nsyl);
			const savetag=parseInlineTag(unit);
			const tagline=unit.substr(1,unit.length-3);
			if (savetag) rawtags.push([a.toString(16),tagline]);
		} else {
			const syllables=syllabify(unit);
			syllables.forEach(syl=>{
				if (isSyllable(syl)) nsyl++;
			});
			l+=unit;
		}
	};
	
	return l;
}
const bookname=[];
const gen=(content,fn)=>{
	const lines=content.split(/\r?\n/);
	let docseq=0;
	bookname.push(fn.substr(3).replace(/\.xml/,''));
	for (let i=0;i<lines.length;i++) {
		let L=lines[i];
		sourcelinenumber=i;
		let extra='';
		if (L.substr(L.length-4,4)!=="</p>") continue;
		L=L.substr(0,L.length-4);
		let rend='';
		docseq++;
		if (L[2]==">") {
			L=L.substr(3); //<p>
		} else {
			L=L.replace(/<p ([^<]+?)>/,(m,attr,idx)=>{
				let attrs=attr.split(/\" +/);
				extra=parseP(attrs,docseq, L.substr(idx+m.length));
				return "";
			});
		}
		const sid=bookseq+":"+docseq;
		let outl=parseLine(L,docseq);
		outl= extra? extra+"|"+outl:outl;
		output.push(sid+","+outl);
	}
}

const dofile=()=>{
	const farr=files[set]//.filter(f=>f[0]=="a");
	if (maxfile) farr.length=maxfile
	dofiles(farr,(content,fn)=>{
		filename=fn;
		bookseq++;	
		gen(content,fn);
	});
}

const write=()=>{
	const outfn=set+"-raw.txt";
	console.log("writing ",outfn);
	fs.writeFileSync(outfn,output.join("\n"),"utf8");
	output.length=0;
	fs.writeFileSync(set+"-rawtag.txt",rawtags.join("\n"),"utf8");
	rawtags.length=0;
	fs.writeFileSync(set+"-toc.txt",tocoutput.join("\n"),"utf8");
	tocoutput.length=0;
	fs.writeFileSync(set+"-paranum.txt",matpara.join("\n"),"utf8");
	matpara.length=0;

	fs.writeFileSync(set+"-bookname.txt",bookname.join("\n"),"utf8");
	bookname.length=0;

	fs.writeFileSync(set+"-repeatnum.txt",JSON.stringify(repeatnum,'',' '),'utf8');
}


dofile();
write();
