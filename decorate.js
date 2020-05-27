const PALI=/([a-zāīūñṅṇŋṁṃḍṭḷ]+)/ig
const {getdef}=require("./lexicon");
const decorateText=(str)=>{
	const tokens=str.split(PALI);

	const decorations=[];
	let offset=0;
	for (var i=0;i<tokens.length;i++) {
		const tk=tokens[i];
		const def=getdef(tk.toLowerCase());
		if (def) {
			decorations.push([offset, tk.length,"@"+def]);
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
			if (typeof arr[i]!=="undefined") out.push([i,arr[i]]);
		}
		prev=arr[i];
	}
	return out;
}




module.exports={snip,decorateText};