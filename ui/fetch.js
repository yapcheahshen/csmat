const {open}=require("dengine");
const {filename2set}=require("./linkparser");
const getaux=db=>{
	const aux=db.getaux();
	if (typeof aux.paranum=="string") aux.paranum=eval(aux.paranum);
	return {paranum:aux.paranum};
}
const getparallel=(db,set,bktoc)=>{
	const m=bktoc.match(/(.+?[mat]\d?)/);
	if (!m) throw "invalid bktoc"

	const bktocset=filename2set(m[1])
	if (bktocset!=db.getname()){
		db=open(bktocset);
		if (!db) return set+" not open yet";		
	}

	const paranum=vpl2paranum(db,bktoc)-1;
	if (set=="att") {
		return bktoc.replace(/(\d+)[mat](\d?)(.+)/,"$1a$2p"+paranum);
	}
	if (set=="tik") {
		return bktoc.replace(/(\d+)[mat](\d?)(.+)/,"$1t$2p"+paranum);
	}

	if (set=="mul") {
		return bktoc.replace(/(\d+)[mat](\d?)(.+)/,"$1m$2p"+paranum);
	}
	return addr;
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
	const {paranum}=getaux(db);

	if (!m) {
		const m2=opts.rawid.match(/(.+?):(.+)/);
		if (m2) {
			let book=parseInt(m2[1]);
			if (book.toString()!==m2[1]){
				book=db.bookname2seq(m2[1]);
			}
			const at= vpl2paranum(db,opts.rawid)+1;
			let end=paranum[book][at]+(opts.extrapara||0);
			const pagecount=end-parseInt(m2[2])-1;
			return Object.assign(opts,{prefix:opts.rawid,pagecount});
		}
		return opts;
	}

	
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
	let end=paranum[book][at]+(opts.extrapara||0);
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
const id_regex=/([vinseabh\d]+[mat]\d?)[:p]([\.\d]+)/
module.exports={parseId,vpl2paranum,getparallel,id_regex,matlabel};