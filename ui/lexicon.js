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
	} else { //ruby and detail explaination
		if (def.length<5 && def[0]!=="@") {
			return {cls,def,extra:""};
		}
		if (def.indexOf("|")>-1) { //指定短字串
			const at=def.indexOf("|");
			extra=def.substr(at+1);
			cls="nissaya"
			def=def.substr(0,at);
			if (extra[0]=="@"){
				extra=getdef(extra.substr(1));
			}
		} else { //取最前面幾個中文字
			extra=def;
			cls="nissaya"
			const s=def.replace(/\(梵/,'(')
			.replace(/【\S+?】/g,'').replace(/\(\S+?\)/g,'')
			.replace(/（\S+?）/g,'').replace(/[a-zāīūñṅṇŋṁṃḍṭḷ\d\.,:!&;的]+/gi,'')
			.replace(/[\(\) ,\.]+/g,'');
			const m=s.match(/(.+?)[，。]/);
			if (m&& m[1].length>1){
				def=m[1].replace(/[\(\)]/g,'').substr(0,5);
				
			} else {
				def='';
				if (extra[0]=="@") {
					extra=getdef(extra.substr(1))
				}
			}
		}
	}
	return {cls,def,extra};
}
module.exports={getdef,parsedef};