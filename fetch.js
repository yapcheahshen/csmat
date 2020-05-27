const getaux=db=>{
	const aux=db.getaux();
	if (typeof aux.paranum=="string") aux.paranum=eval(aux.paranum);
	return {paranum:aux.paranum};
}
const getparallel=(set,rawid)=>{
	if (set=="att") {
		return rawid.replace(/(\d+)[mat]/,"$1a");
	}
	if (set=="tik") {
		return rawid.replace(/(\d+)[mat]/,"$1t");
	}

	if (set=="mul") {
		return rawid.replace(/(\d+)[mat]/,"$1m");
	}
	return rawid;
}

const vpl2paranum=(db,vpl)=>{
	let at=vpl.indexOf(":");
	const bookname=vpl.substr(0,at);
	const page=parseInt( vpl.substr(at+1));
	const {paranum}=getaux(db);
	let book;
	if (parseInt(bookname).toString()==bookname) {
		book=parseInt(bookname)
	} else {
		book=db.bookname2seq(bookname);
	}
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
	const m=opts.rawid.match(/(.+?)p(\d+)/);
	if (!m) {
		const m2=opts.rawid.match(/(.+?):(.+)/);
		if (m2) {
			return Object.assign(opts,{prefix:opts.rawid});
		}
		return opts;
	}

	const {paranum}=getaux(db);
	let bookname=m[1],book;
	const para=parseInt(m[2]);
	
	if (parseInt(bookname).toString()==bookname) {
		book=parseInt(bookname);
		bookname=db.bookseq2name(book);
	} else {
		book=db.bookname2seq(bookname);
	}

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

	const prefix=bookname+":"+start;
	const pagecount=end-start;
	return Object.assign(opts,{prefix,pagecount});
}

const An=(m1,m2)=>{
	if (m1=="2") {
		return parseInt(m2)+1
	}
	if (m1=="3"){
		return parseInt(m2)+4
	}
	if (m1=="4"){
		return parseInt(m2)+7
	}
	return 1;
}
const patterns=[
  [/s010(\d)mp/,'dn$1.'],
  [/s020(\d)mp/,'mn$1.'],
  [/s030(\d)mp/,'sn$1.'],
  [/s040(\d)m(\d?)p/,(m,m1,m2)=>'an'+An(m1,m2)+'.'],
  [/s010(\d)ap/,'da$1.'],
  [/s020(\d)ap/,'ma$1.'],
  [/s030(\d)ap/,'sa$1.'],
  [/s040(\d)a(\d?)p/,(m,m1,m2)=>'aa'+An(m1,m2)+'.'],
  [/s010(\d)tp/,'dt$1.'],
  [/s020(\d)tp/,'mt$1.'],
  [/s030(\d)tp/,'st$1.'],
  [/s040(\d)t(\d?)p/,(m,m1,m2)=>'at'+An(m1,m2)+'.'],
]
const matlabel=hyperlink=>{
	let o=hyperlink;
	patterns.forEach(pat=>{
		o=o.replace(pat[0],pat[1]);
	})
	return o;
}
const id_regex=/([vinseabh\d]+[mat]\d?)p(\d+)/
module.exports={parseId,vpl2paranum,getparallel,id_regex,matlabel};