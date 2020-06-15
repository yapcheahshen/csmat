'use strict';
const {SEGSEP,open,readlines,stringify}=require("pengine");

const getparallel=(cap,set)=>{
	let str=cap.stringify();
	str=str.replace(/y.+/g,'');
	const parallel={"cs0att":"a","cs0tik":"t","cs0mul":"m"};

	return str.replace(/[mat](\d?)_/,parallel[set]+"$1_");
}
/*
const vpl2paranum=(db,vpl)=>{
	let at=vpl.indexOf(SEGSEP);
	const bookname=vpl.substr(0,at);
	const page=parseInt( vpl.substr(at+1));
	const {paranum}=db.getaux();
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
	const {paranum}=db.getaux();

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
*/
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
  [/s010(\d)m_p/,'dn$1.'],
  [/s020(\d)m_p/,'mn$1.'],
  [/s030(\d)m_p/,'sn$1.'],
  [/s040(\d)m(\d?)_p/,(m,m1,m2)=>'an'+An(m1,m2)+'.'],
  [/s010(\d)a_p/,'da$1.'],
  [/s020(\d)a_p/,'ma$1.'],
  [/s030(\d)a_p/,'sa$1.'],
  [/s040(\d)a(\d?)_p/,(m,m1,m2)=>'aa'+An(m1,m2)+'.'],
  [/s010(\d)t_p/,'dt$1.'],
  [/s020(\d)t_p/,'mt$1.'],
  [/s030(\d)t_p/,'st$1.'],
  [/s040(\d)t(\d?)_p/,(m,m1,m2)=>'at'+An(m1,m2)+'.'],
]
const matlabel=hyperlink=>{
	let o=hyperlink;
	patterns.forEach(pat=>{
		o=o.replace(pat[0],pat[1]);
	})
	return o;
}

const id_regex=/([vinseabh\d]+[mat]\d?)_(.+)/



module.exports={getparallel,id_regex,matlabel};