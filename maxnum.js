// calculate maximum number of book,paragraphs, paranum, syllables
const fs=require("fs");
const {dofiles,getfiles}=require("./dofile");
const {syllabify,isSyllable,combinegatha}=require("./paliutil");
const set=process.argv[2] || "mul"
const farr=getfiles("./cscd-book/")[set];//.filter(fn=>fn.substr(0,3)=="s01");
let maxsylcount=0,maxlinecount=0;

const remove_nontext=s=>{
	s=s.replace(/<note>.+?<\/note>/g,"");
	s=s.replace(/<.+?>/g,"");
	return s;
}
const breakUppercase=s=>{
	return s.replace(/ (‘*?[A-YĀŪĪṄÑṆḌṬ])/g,(m,m1)=>"\n"+m1);
}

const getparanum=content=>{
	const paranum=[];
	content.replace(/<hi rend="paranum">(\S+)<\/hi>/g,(m,m1)=>{
		if (parseInt(m1).toString()==m1) paranum.push(parseInt(m1))
		else paranum.push(m1);

	});

	if (paranum.length==paranum[paranum.length-1]) {
		return "*"+paranum.length.toString();
	}
	return paranum;
}
const paranums={};

dofiles(farr,(content,fn)=>{
	//process.stdout.write("\r"+fn);
	content=content.replace(/\r?\n/g,"\n");
	paranums[fn]=getparanum(content);
//	content=combinegatha(content)
	content=remove_nontext(content);
	if (fn[0]=="e") content=breakUppercase(content);
	const lines=content.split(/\r?\n/);
	let linecount=0,totalsylcount=0;
	lines.forEach( line=>{
		if (!line)return;
		const arr=syllabify(line);
		let sylcount=0;

		arr.forEach( item=>{
			if (isSyllable(item)) sylcount++;
			
		});
		totalsylcount+=sylcount;
		if (sylcount>maxsylcount){
			maxsylcount=sylcount;
			if (sylcount>2048) {
				console.log("long syllable",fn,maxsylcount,line.substr(0,30))
			}	
		};

		linecount++;
	})
	console.log(fn,linecount,"syl/line", (totalsylcount/linecount).toFixed(2))
	if (linecount>maxlinecount) maxlinecount=linecount;
});

console.log("max line count",maxlinecount);
console.log("max syllable count",maxsylcount);
fs.writeFileSync("paranum.json",JSON.stringify(paranums),"utf8");

//without breaking uppercase
//mul linecount 14647, syl count 1576
//att           6739             1537
//tik           15500            1592
//nrf           15945            11343 
// e0301n, e1102n(雜集) has very long paragraph, 雜集切小段

//with breaking uppercase
//mul  15162 1448
//att  16711 1536
//tik  19651 1476
//nrf  15949 1382


//combine gatha , linecount
//mul 8046
//att 3519
//tik 5400

//nrf 15943
//
/*
mul 61 books,  att 47bk , tik 41bk att+tik=88
each set   = 6bits    64
line count = 13 bits  8192  => postings 3bytes encoding
sylcount     11 bits  2048

6+13+11 = 30 bits 
range 6+13+11+11 = 41 bits

book.line.

3:5:10-33   book 3, line 5 , 10th to 33 syllable

*/ 

