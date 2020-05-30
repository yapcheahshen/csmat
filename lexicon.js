const lexjs=palilexicon;

const {bsearch}=require("dengine");

const getdef=(w)=>{
	if (typeof w=="number"){
		const at=lexjs[w].indexOf("=");
		return lexjs[w].substr(at+1);
	}
	if (!w)return;

	let at=bsearch(lexjs,w,true);
	let lex='';
	if (at>-1&&lexjs[at]) {
		lex=lexjs[at].substr(0,w.length+1);
	}
	if (lex==w+'=') {
		return lexjs[at].substr(w.length+1);
	}
	return '';
}
const parsedef=(def)=>{
	let cls="",extra='';
	if (def[0]=="+") {
		cls="verb";
		def=def.substr(1);
	} else if (def[0]=="%") {
		cls="proper";
		def=def.substr(1);
	} else if (def[0]=="!") {
		cls="solo";
		def=def.substr(1);
	} else if (def.indexOf("|")) { //ruby and detail explaination
		const at=def.indexOf("|");
		extra=def.substr(at+1);
		cls="nissaya"
		def=def.substr(0,at);
		if (extra[0]=="@"){
			extra=getdef(extra.substr(1));
		}
	}
	return {cls,def,extra};
}
module.exports={getdef,parsedef};