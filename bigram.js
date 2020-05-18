/* print bigram*/
const fs=require("fs");
const {dofiles,getfiles}=require("./dofile");
const set=process.argv[2] || "*"
const maxfile=parseInt(process.argv[3],0);
const files=getfiles("./raw/");
const farr=files[set];
const output=[];

const {syllabify,isSyllable}=require("./paliutil");

const bigram={};
let tokencount=0 ;
dofiles(farr,(content,fn)=>{
	const arr=syllabify(content);
	process.stdout.write("\r"+fn+ "   ");
	for (let i=0;i<arr.length-1;i++) {
		const first=arr[i].toLowerCase();

		let token='';
		let second=arr[i+1].toLowerCase();
		if (isSyllable(first)) {
			if (isSyllable(second)) {
				token=first+second;
			} else {
				token=first;
			}
			tokencount++;
		}
		if (!token)continue;
		if (!bigram[token]) bigram[token]=0;
		bigram[token]++;
	}
})
const out=[];
for (let token in bigram) {
	out.push([token,bigram[token]]);
}
out.sort((a,b)=>b[1]-a[1]);

fs.writeFileSync("bigram.txt","total"+tokencount+"\n"+out.join("\n"),"utf8");