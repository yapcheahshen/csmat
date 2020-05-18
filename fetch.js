const parseId=(db,opts)=>{
	const m=opts.rawid.match(/(\d+),(\d+)/);
	if (!m)return opts;
	const aux=db.getaux();
	if (typeof aux.paranum=="string") aux.paranum=eval(aux.paranum);
	if (typeof aux.bookname=="string") aux.bookname=aux.bookname.split("\n");
	const paranum=aux.paranum, bookname=aux.bookname;
	const book=parseInt(m[1]);
	const para=parseInt(m[2]);

	let at=para;
	let start=paranum[book][at];
	while (!start && at>0) {
		at--;
		start=paranum[book][at];
	}

	at=para+1;
	let end=paranum[book][at+1];
	while (!end && at>0) {
		at--;
		end=paranum[book][at];
	}

	const prefix=book+":"+start;
	const pagecount=end-start;
	console.log("prefix",prefix)
	return Object.assign(opts,{prefix,pagecount});
}
module.exports={parseId};