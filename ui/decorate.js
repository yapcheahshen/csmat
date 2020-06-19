'use strict';
const PALI=/([a-zāīūñṅṇŋṁṃḍṭḷ]+)/ig
const {getdef}=require("./lexicon");
const {syllabify,isSyllable,isPaliword,parseCAP}=require("pengine");
const {suggestedBreak}=require("paliword");
const {matlabel}=require("./fetch");
const BACKLINKSEP="|";
const {createBacklinkCard}=require("./backlinks")
const {makecanonref}=require("./canonref");
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
		if (len==0 && deco) {
			arr[p]+=deco+' ';
		}
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

const inlinenotebtn=(h,m1,notes,nline,tprops)=>{
	let p=0;
	const note=notes[nline+"_"+m1];
	const btns=[];
	if (note) {
		note.trim().replace(/#(.+?);/g,(m,addr)=>{

			const label=makecanonref(parseCAP(matlabel(addr)));
			const props=Object.assign({addr,label},tprops);
			btns.push(h('cardbutton',{props}));
		})
		if (!btns.length){
			const props=Object.assign({id:m1,note},tprops);
			btns.push(h('notebutton',{props}));
		}
	}
	return btns;
}

const decorateText=({cap,i,x,t,nti,props,notes,backlinks,backlink,h,onclick})=>{
	const decorations=[];
	let bold=0,paranum;
	let marker=-1;
	if (cap.z<1 && cap.y>0) marker=cap.y;
	let y=0,off=0,start=-1,z=cap.z;

	let mheader=t.match(/([a-z\d]+)\|/);
	if (mheader) {
		const headerstyle=mheader[1];
		paranum=parseInt(headerstyle);
		
		t=t.substr(mheader[0].length);
		if (isNaN(paranum)){
			decorations.push([0,t.length,headerstyle]);
		}
	}
	const syl=syllabify(t);

	if (nti){
		nti=nti.substr(0,nti.length-1);
		nti=nti.replace(/[iī]$/g,"[iī]").
		replace(/[uū]$/g,"[uū]").replace(/[aā]$/g,"[aā]")
		const ntiregex=new RegExp(nti,"gi");

		t.replace(ntiregex,(m,idx)=>{
			decorations.push([idx,m.length,"ti"]);
		})		
	}
	backlinks=backlinks||[];
	const bls={};
	backlinks.forEach(item=>{
		const at=item.indexOf(BACKLINKSEP);
		const sourceaddr=item.substr(0,at);
		const targetaddr=item.substr(at+1);
		const c=parseCAP(cap.bk+"_"+cap._+targetaddr);
		const pos=c.y+c.z;
		if (!bls[pos]) bls[pos]=[];
		bls[pos].push(item);
	})
	for (let j=0;j<syl.length;j++){
		if (y==cap.y) start=off;
		if (syl[j][syl[j].length-1]=="{") {
			bold=off+syl[j].length;
		}
		if (syl[j].trim()=="}"){
			decorations.push([bold,off-bold,"nti"]);
		}
		if (bls[y]) {
			bls[y].forEach(bl=>{
				decorations.push([off,0,"~"+bl])
			});
			bls[y]=[];
		}

		if ( (z!==-1&&y==cap.y+z&&cap.x0==x)){
			//if (!(decorations.length&&decorations[decorations.length-1][0]==off)){
				if (off==start){ //null marker
					decorations.push([start, 0,""]);//no style for zero span, 
				} else {
					decorations.push([start, off-start, "yzrange"]);
				}
			//}
		}

		if (isSyllable(syl[j])) {
			y++;
		} 
		
		off+=syl[j].length;
	}

	const children=[];
	const snippet=snip(t,decorations);
	y=0 ;
	let j=0,n=0,str='',prevclass='',yinc=0, syl_i=0 ,ch='';
	let sycnt=syl[0].length;
	const addspan=()=>{
		const on={click:onclick};
		if (prevclass[0]=="~") {
			const links=prevclass.split(" ").filter(item=>item);
			links.forEach(link=>{
				if (!link || link[0]!=='~') return;
				const _props=Object.assign(props,{cap,link:link.substr(1)});
				if (backlink==link.substr(1)) {
					children.push( createBacklinkCard(h,_props));
				} else {
					children.push(h('backlinkbtn',{props:_props}))				
				}
			})
			prevclass='';
		} 
		if (str) children.push(h('span',{on,attrs:{y},class:prevclass},str));
	}
	while(j<=t.length){ 
		if (!sycnt) {
			if (isSyllable(syl[syl_i]))yinc++
			if( syl_i+1<syl.length) sycnt=syl[++syl_i].length;
		}

		if (n<snippet.length&&snippet[n][0]==j) {
			addspan();
			str='';
			prevclass=snippet[n][1];
			if (!prevclass) prevclass='';
			n++;
		}
		if (str=='') {
			off=j;
			y=yinc;
		}
		ch=t[j];
		if (ch=="{"||ch=="}") ch='';
		if (ch=="^"){
			let num=j+1;
			const m=t.substr(j+1).match(/(\d+)/);
			j+=m[1].length;
			addspan();
			let btns=inlinenotebtn(h,m[1],notes,i,props);
			for (let k=0;k<btns.length;k++){
				children.push(btns[k]);
			}
			ch='';
			str='';
		}
		if (y==marker){ //marking backlink source pos
			children.push(h('span',{attrs:{y},class:'marker'}));
			marker=-1;
		}
		if (j<t.length) str+=ch;
		j++;
		sycnt--;
	}
	addspan();
	if (paranum) children.unshift(h("span",paranum+"."))
	children.push(h('br'));	
	return children;
}

module.exports={snip,nissayaText,decorateText};