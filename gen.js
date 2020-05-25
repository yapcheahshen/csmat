const fs=require("fs");
const {dofiles,getfiles}=require("./dofile");
const set=process.argv[2] || "mul"
const maxfile=parseInt(process.argv[3],0);
const files=getfiles("./raw/");
const {isSyllable,syllabify,isPaliword,palialpha}=require("./paliutil");
const {LANGSEP}=require("dengine")

let bookseq=0;
const output=[];
const rawtags=[];
const tocoutput=['1:1,0Tipitaka'];
const matpara=[];

let filename='',sourcelinenumber=0;
const TocEle={nikaya:1,book:2,chapter:3,title:4,subhead:5}//,subsubhead:6}
const isToc=rend=>{
	return TocEle[rend];
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
const {makemataddr}=require("./mataddr");
const {expandrange}=require("./paliutil")
const repeatnum={};
let nikaya='',lastdepth=0;
const parseP=(attrs,docseq,linetext)=>{
	let extra='',paranum=''; //
	const a=makemataddr(bookseq,docseq);
	attrs.forEach(attr=>{
		if (attr[attr.length-1]=='"') {
			attr=attr.slice(0,attr.length-1);
		}
		const m=attr.match(/(\S+?)="(.+)/);
		if (m[1]=="rend") {
			if (isToc(m[2])) {
				let depth=isToc(m[2]);
				if (depth>lastdepth+1) {
					//patch missing level
					tocoutput.push([bookseq+":"+docseq+","+(depth-1)+"|"+"-"]);
				}

				lastdepth=depth;
				const purelinetext=linetext.replace(/<[^<]+?>/,"");

				if (!(depth==1 && nikaya==purelinetext)) {
					tocoutput.push([bookseq+":"+docseq+","+depth+"|"+purelinetext])					
				}
								
				if (depth==1) nikaya=purelinetext;
			}
			extra=m[2];
		} else if (m[1]=='pn' || m[1]=='PN') {
			//check continuity , pack as array of book+docseq
			if (!matpara[bookseq])matpara[bookseq]=[0];
			const arr=matpara[bookseq];
			const range=m[2].split("-");
			paranum=m[2];
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
			}
		} else {
			console.log("unknown p attributes ",m[1],filename,sourcelinenumber);
		}
	})
	return paranum+extra;
}
const parseLine=(line,docseq)=>{
	let units=line.split(/(<.+?>)/);
	let l='';
	let nsyl=0; //syllable pointer
	let nnote=0,notestr=''; // inline note counter
	for (var i=0;i<units.length;i++){
		unit=units[i];
		if (unit[0]=="<") {
			const a=makemataddr(bookseq,docseq,nsyl);
			const savetag=parseInlineTag(unit);
			const tagline=unit.substr(1,unit.length-3);
			if (savetag) rawtags.push([a.toString(16),tagline]);
			if (unit.substr(0,6)=="<note ") {
				nnote++;
				l+="^"+nnote;
				if (notestr) notestr+=" ";
				notestr+=nnote+"^"+unit.match(/<note [a-z]+="(.+?)"/)[1];
			}
		} else {
			const syllables=syllabify(unit);
			syllables.forEach(syl=>{
				if (isSyllable(syl)) nsyl++;
			});
			l+=unit;
		}
	};
	if (notestr) {
		l+=LANGSEP+notestr;
	}
	return l;
}
//const booknames=[];
const gen=(content,fn)=>{
	const lines=content.split(/\r?\n/);
	const bk=fn.substr(3).replace(/\.xml/,'');
	let docseq=0;
	//booknames.push(bk);
	for (let i=0;i<lines.length;i++) {
		let L=lines[i];
		sourcelinenumber=i;
		if (L.substr(L.length-4,4)!=="</p>") continue;
		L=L.substr(0,L.length-4);
		let rend='';
		docseq++;
		let extra='';
		if (L[2]==">") {
			L=L.substr(3); //<p>
		} else {
			L=L.replace(/<p ([^<]+?)>/,(m,attr,idx)=>{
				let attrs=attr.split(/\" +/);
				extra=parseP(attrs,docseq, L.substr(idx+m.length));				
				return "";
			});

		}
		let sid=":"+docseq;
		if (docseq==1) {
			sid=bk+sid;
			console.log(bk)
		}
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
	fs.writeFileSync(set+"-rawtoc.txt",tocoutput.join("\n"),"utf8");
	tocoutput.length=0;
	fs.writeFileSync(set+"-paranum.txt",matpara.join("\n"),"utf8");
	matpara.length=0;

	//fs.writeFileSync(set+"-bookname.txt",bookname.join("\n"),"utf8");
	//bookname.length=0;

	fs.writeFileSync(set+"-repeatnum.txt",JSON.stringify(repeatnum,'',' '),'utf8');
}


dofile();
write();
