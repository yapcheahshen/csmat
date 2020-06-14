const {syllabify,isSyllable}=require("pengine");

const getattr=(node,attr)=>{
	while (node) {
		if (node.attributes&&node.attributes[attr]){ 
			return parseInt(node.attributes[attr].value);
		}
		node=node.parentNode;
		if (!node || node==document) break;
	}
	return undefined;
}
const getCAPSelection=()=>{
	const sel=document.getSelection();
	const b=sel.baseNode, e=sel.extentNode;
	const boff=sel.baseOffset, eoff=sel.extentOffset;
	const bx0=getattr(b,'x0');
	const ex0=getattr(e,'x0');
	if (bx0!=ex0) return null; //cross line not supported

	const y1=getattr(b,'y');
	const y2=getattr(e,'y');

	if (typeof y1=="undefined" || typeof y2=="undefined") return null;

	const s1=syllabify(b.nodeValue);
	const s2=syllabify(e.nodeValue);

	let off=0,y=0,z=0;
	for (var i=0;i<s1.length;i++) {
		if (isSyllable(s1[i])) {
			y++;
		}
		off+=s1[i].length;
		if (off>=boff) break;
	}

	off=0;
	for (var i=0;i<s2.length;i++) {
		if (isSyllable(s2[i])) {
			z++;
		}
		off+=s2[i].length;
		if (off>=eoff) break;
	}
	return {x0:bx0,y:y+y1, z:y2+z-y-y1};
}

module.exports={getCAPSelection}