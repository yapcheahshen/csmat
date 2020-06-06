const fs=require("fs");
const {dofiles,getfiles}=require("./dofile");
const set=process.argv[2] || "mul"
const maxfile=parseInt(process.argv[3],0);
const files=getfiles("./raw/");
const {LANGSEP,isSyllable,syllabify,isPaliword,parse}=require("dengine");

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
//deal with range short
const expandrange=(from,to)=>{ //  310-21 => 310-320
	if (isNaN(to))return from;
	if (to>from)return to;
	if (to<10) {
		to+=from-from%10;
	} else if (to<100) {
		to+=from-from%100;
	} else if (to<1000) {
		to+=from-from%1000;
	} else {
		console.log("too big",to)
		throw " range error"+filename+sourcelinenumber;
	}
	return to;
}
const {makemataddr}=require("./ui/mataddr");
const {recognise,linkpatterns,filename2set,hyperlink_regex}=require("./ui/linkparser");
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
			const pnarr=matpara[bookseq];
			const range=m[2].split("-");
			paranum=m[2];
			if (range.length==1) {
				let at=parseInt(range[0]);
				if (pnarr[at]) {
					if (!repeatnum[filename])repeatnum[filename]=[];
					repeatnum[filename].push(sourcelinenumber);
				}
				pnarr[at] = docseq-1; //zero-base
			} else {
				const from=parseInt(range[0]);
				let to=parseInt(range[1]);
				to=expandrange(from,to);
				if (to<from) {
					console.log("para range error",range,filename,sourcelinenumber+1);
				}
				pnarr[from]=docseq-1; //zero-base
				// search backward if item is null
				pnarr[to]=docseq-1; //zero-base
			}
		} else {
			console.log("unknown p attributes ",m[1],filename,sourcelinenumber);
		}
	})
	return paranum+extra;
}
const matlinks=[]; //for backlinks

const parseLine=(line,docseq)=>{
	let units=line.split(/(<.+?>)/);
	let l='';
	let nsyl=0,z=0; //syllable pointer
	let nnote=0,notestr='',qqopen=-1,qqclose=-1,qopen=-1,qclose=-1; // inline note counter
	

	const nearestquote=()=>{
		let capaddr=bookseq+"_x"+(docseq-1)+(nsyl?"y"+nsyl:"");
		let qdist=line.length,qqdist=line.length; //not more than this

		if (qclose>qopen) qdist=nsyl-qclose;
		if (qqclose>qqopen) qqdist=nsyl-qqclose;
		
		if (qqdist<line.length||qdist<line.length) {
			if (qqdist<qdist) {
				capaddr=bookseq+"_x"+(docseq-1)+"y"+qqopen+"z"+(qqclose-qqopen);
			} else {
				capaddr=bookseq+"_x"+(docseq-1)+"y"+qopen+"z"+(qclose-qopen);
			}
		}
		return capaddr;
	}

	for (var i=0;i<units.length;i++){
		unit=units[i];
		if (unit[0]=="<") {
			//const mataddr=makemataddr(bookseq,docseq,nsyl);
			let capaddr=bookseq+"_x"+(docseq-1)+(nsyl?"y"+nsyl:"");
			const savetag=parseInlineTag(unit);
			const tagline=unit.substr(1,unit.length-3);
			if (savetag) rawtags.push([capaddr,tagline]);
			if (unit.substr(0,6)=="<note ") {
				nnote++;
				l+="^"+nnote;
				if (notestr) notestr+=" ";
				let nc=unit.match(/<note [a-z]+="(.+?)"/)[1]
				linkpatterns.forEach(pat=>{
					nc=nc.replace(pat,m=>{
						let translated=recognise(m);
						if (typeof translated=="string") {
							let capaddr=nearestquote();
							matlinks.push([ capaddr ,"#"+translated+";"]);
							return "#"+translated+";";
						} else {
							return m;
						}
					})
				})
				notestr+=nnote+"^"+nc;
			}
		} else {
			const syllables=syllabify(unit);
			syllables.forEach(syl=>{
				if (isSyllable(syl)) nsyl++;
				else {
					if (syl.indexOf("“")>-1) qqopen=nsyl;
					if (syl.indexOf("”")>-1) qqclose=nsyl;
					if (syl.indexOf("‘")>-1) qopen=nsyl;
					if (syl.indexOf("’")>-1) qclose=nsyl;
					if (syl.indexOf(".")>-1) { //reset
						if (qclose>qopen) qclose=qopen=-1;
						if (qqclose>qqopen) qqclose=qqopen=-1;
					}
					//normally “  ”ti ^
					//“  ‘’ti ^    ”  rare
					//there are 5000+ inline note following double quote in att
					//only 37 following single quote 
				}
			});
			l+=unit;
		}
	};
	if (notestr) {
		l+=LANGSEP+notestr;
	}
	return l;
}
const changepunc=line=>{
	return line.replace(/‘‘‘/g,"“‘")
			   .replace(/’’’/g,"’”")
			   .replace(/‘‘/g,"“")
			   .replace(/’’/g,"”");
}
//const booknames=[];
const gen=(content,fn)=>{
	const lines=content.split(/\r?\n/);
	const bk=fn.substr(3).replace(/\.xml/,'');
	let docseq=0;
	//booknames.push(bk);
	for (let i=0;i<lines.length;i++) {
		let L=lines[i];
		if (i==lines.length-1){
			L=L.replace(/\r?<\/cscd>/,''); //missing one \n at second line line
		}

		L=changepunc(L)
		sourcelinenumber=i;
		if (L.substr(L.length-4,4)!=="</p>") {
			continue;
		}
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
/*
{"targetdb":{
	targetbkname:[
		"srcmataddr_p_targetparanum"
	]
}}
*/
const groupmatlinksindb=()=>{
	const groups={};
	for (var i=0;i<matlinks.length;i++ ){
		const srcmataddr=matlinks[i][0];
		const hyperlink=matlinks[i][1];
		const set=filename2set( matlinks[i][1] );
		if (!groups[set]) groups[set]={};

		const m=hyperlink.match(hyperlink_regex);
		if (!groups[set][m[1]]) groups[set][m[1]]=[];
		groups[set][m[1]].push(srcmataddr+"|p"+m[2]);
	}
	return groups;
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
	const groups=groupmatlinksindb();
	fs.writeFileSync(set+"-matlinks.txt",JSON.stringify(groups),'utf8');
}


dofile();
write();
