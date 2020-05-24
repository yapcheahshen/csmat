const fs=require("fs");
const mulbookname=fs.readFileSync("./mul-bookname.txt","utf8").split(/\r?\n/);
const attbookname=fs.readFileSync("./att-bookname.txt","utf8").split(/\r?\n/);
const tikbookname=fs.readFileSync("./tik-bookname.txt","utf8").split(/\r?\n/);
const bookname={
	mul:mulbookname,att:attbookname,tik:tikbookname
}
const getbookname=(set,n)=>{
	const bn=bookname[set];
	if (!bn)return null;
	return bn[n-1];
}
module.exports={getbookname};