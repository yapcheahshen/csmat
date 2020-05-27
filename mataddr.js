const MAXDOC=1<<16; //<p> is a doc
const MAXSYL =1<<12;
/*
const {bookseq2filename}=require("./bookseq");
const humanlink=(set,mataddr)=>{
	const o=unpackmataddr(mataddr);
	if (!o)return null;
	const bk=bookseq2filename(set,o[0]);

	if (!bk)return null;
	let s=bk+"d"+o[1];//need db to translate to p
	if (o[2]) s+="y"+o[2];
	return s;
}
*/
const makemataddr=(nbook=0,ndoc=1,nsyl=0)=>{ 
	if (ndoc>=MAXDOC)throw ndoc+" doc exceed limit " +filename+" "+sourcelinenumber;
	if (nsyl>=MAXSYL)throw nsyl+" syllabus exceed limit " +filename+" "+sourcelinenumber;
	return nsyl+ndoc*(1<<12)+nbook*(1<<28);
}
const unpackmataddr=addr=>{
	const syl= 0xfff & addr;

	addr=Math.floor(addr / 4096);
	const doc = addr & 0xffff;
	const book= addr>>16;
	return [book,doc,syl];
}

module.exports={unpackmataddr,makemataddr}