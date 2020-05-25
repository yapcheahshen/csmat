const fs=require("fs");
const mulbookname=fs.readFileSync("./mul-bookname.txt","utf8").split(/\r?\n/);
const attbookname=fs.readFileSync("./att-bookname.txt","utf8").split(/\r?\n/);
const tikbookname=fs.readFileSync("./tik-bookname.txt","utf8").split(/\r?\n/);
const bookname={
	mul:mulbookname,att:attbookname,tik:tikbookname
}
const bookseq2filename=(set,n)=>{
	const bn=bookname[set];
	if (!bn)return null;
	return bn[n-1];
}
const filename2bookseq=name=>{ //
	for (var set in bookname) {
		for (var i=0;i<bookname[set].length;i++) {
			if (bookname[set][i]==name) {
				let seq="0"+(i+1);
				seq=seq.substr(seq.length-2);
				return set+seq;
			}
		}
	}
}
module.exports={bookseq2filename,filename2bookseq};