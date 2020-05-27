const plizh=require("./lexicon-pli-zh").trim()
		.split(/\r?\n/).sort((a,b)=>(a==b)?0:((a>b)?1:-1));

const {bsearch}=require("dengine");

const getdef=w=>{
	if (!w)return;
	let at=bsearch(plizh,w,true);
	let lex='';
	if (at>-1&&plizh[at]) {
		lex=plizh[at].substr(0,w.length+1);
	}

	//if (lex+"="==w+"=" || lex+"o="==w+"=" || lex+"a="==w+"="
	//	|| lex+"e="==w+"=") {
	if (lex==w+'=') {
		return plizh[at].substr(w.length+1);
	}
	return '';
}
const parsedef=def=>{
	let cls="";
	if (def[0]=="+") {
		cls="verb";
		def=def.substr(1);
	} else if (def[0]=="%") {
		cls="proper";
		def=def.substr(1);
	}
	return {cls,def};
}
module.exports={getdef,parsedef};