const getaux=db=>{
	const aux=db.getaux();
	if (typeof aux.paranum=="string") aux.paranum=eval(aux.paranum);
	if (typeof aux.bookname=="string") aux.bookname=aux.bookname.split("\n");
	return {bookname:aux.bookname,paranum:aux.paranum};
}
const vpl2paranum=(db,vpl)=>{
	let at=vpl.indexOf(":");
	const book=parseInt(vpl.substr(0,at));
	const page=parseInt( vpl.substr(at+1));
	const {bookname,paranum}=getaux(db);

	const arr=paranum[book];
	let prev=0,l=0;
	for (var i=0;i<arr.length;i++) {
		if (arr[i]==0) l=prev;
		else l=arr[i];
		if (l>=page) {
			return i;
		}
		prev=l;
	}
	return 0;
}
const parseId=(db,opts)=>{
	const m=opts.rawid.match(/(\d+),(\d+)/);
	if (!m)return opts;

	const {bookname,paranum}=getaux(db);
	const book=parseInt(m[1]);
	const para=parseInt(m[2]);

	let at=para;
	let start=paranum[book][at];
	while (!start && at>0) {
		at--;
		start=paranum[book][at];
	}

	at=para+1;
	let end=paranum[book][at];
	while (!end && at>0) {
		at--;
		end=paranum[book][at];
	}

	const prefix=book+":"+start;
	const pagecount=end-start;
	return Object.assign(opts,{prefix,pagecount});
}
module.exports={parseId,vpl2paranum};