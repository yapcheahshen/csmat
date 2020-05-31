const PALI=/([a-zāīūñṅṇŋṁṃḍṭḷ]+)/ig
const {getdef}=require("./lexicon");
const {suggestedBreak}=require("paliword");
const trimdef=d=>{
	let o='';
	if (!d)return '';
	const at=d.indexOf("=");
	d=d.substr(at+1);
	const m=d.match(/(.+?)[。，！]/)
	if (m){
		o=m[1].replace(/【.+?】/g,'');
	}
	return o;
}
const decorateText=(str)=>{
	const tokens=str.split(PALI);

	const decorations=[];
	let offset=0;
	for (var i=0;i<tokens.length;i++) {
		const tk=tokens[i].toLowerCase();
		if (parseInt(tk)){
			offset+=tk.length;
			continue;
		}
		if (tk=="ekacīvaro")debugger
		const breakup=suggestedBreak(tk);

		for (var j=0;j<breakup.length;j++) {
			const b=breakup[j];
			if (Array.isArray(b)){
				if (b[1]!==-1){
					if (Array.isArray(b[1])){
						let d=getdef(b[1][0]);

						decorations.push(
						[offset+b[1][1],
						b[1][2] ,"@"+d]);							
					} else {//solo
						decorations.push([offset,b[0].length,"@!"+b[1]]);
					}
				}
			}
		}
		offset+=tk.length;
	}
	return snip(str,decorations);
}

const snip=(str,decoration)=>{
	const arr=[];
	for (var i=0;i<decoration.length;i++) {
		const de=decoration[i];
		const p=de[0],len=de[1],deco=de[2];

		for (var j=p;j<p+len;j++){
			if (!arr[j]) arr[j]='';
			else arr[j]+=' ';
			arr[j]+=deco;
		}
		if (!arr[p+len]) arr[p+len]='';
	}
	const out=[];
	let prev='';
	for (var i=0;i<arr.length;i++){
		if (prev!==arr[i]) {
			if (typeof arr[i]!=="undefined") {
				out.push([i,arr[i]]);
			}
		}
		prev=arr[i];
	}
	return out;
}




module.exports={snip,decorateText};