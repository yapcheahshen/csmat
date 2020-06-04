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
const nissayaText=(str)=>{
	const tokens=str.split(PALI);

	const decorations=[];
	let offset=0;
	for (var i=0;i<tokens.length;i++) {
		const tk=tokens[i].toLowerCase();
		if (parseInt(tk)){
			offset+=tk.length;
			continue;
		}
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
const {syllabify,isSyllable,isPaliword}=require("../paliutil")
const decorateText=({cap,i,x,t,props,notes,h,inlinenoterenderer})=>{
	const decorations=[];
	const syl=syllabify(t);

	if (cap.x0==x && cap.y){ //the cap line
		let y=0,off=0,start=-1,z=cap.z,endword=false;		
		for (var j=0;j<syl.length;j++){
			
			if (y==cap.y) start=off;

			if ( (z!==-1&&y==cap.y+z) || endword){
				if (!(decorations.length&&decorations[decorations.length-1][0]!==off)){
					if (off==start){ //null marker
						decorations.push([start, 0,""]);//no style for zero span, 
					} else {
						decorations.push([start, off-start, "yzrange"]);
					}
				}
			}
			if (isSyllable(syl[j])) {
				y++;
			} else if (start>-1 && z==-1) {
				endword=true;//
			}
			
			off+=syl[j].length;
		}

	}
	const children=[];
	const snippet=snip(t,decorations);
	let n=0,str='',prevclass='',y=0 ,yinc=0, syl_i=0;
	let sycnt=syl[0].length;
	for (var j=0;j<=t.length;j++){ 
		if (!sycnt) {
			if (isSyllable(syl[syl_i]))yinc++
			if( syl_i+1<syl.length) sycnt=syl[++syl_i].length;
		}

		if (n<snippet.length&&snippet[n][0]==j) {
			children.push(h('span',{attrs:{y},class:prevclass},str));
			str='';
			prevclass=snippet[n][1];
			if (!prevclass) prevclass='';
			n++;
		}
		if (str=='') {
			off=j;
			y=yinc;
		}
		if (j<t.length) str+=t[j];
		sycnt--;
	}
	if (snippet.length==1)prevclass='marker';//for source book page marker
	children.push(h('span',{attrs:{y},class:prevclass},str));
	children.push(h('br'));	
	return children;
}

module.exports={snip,nissayaText,decorateText};