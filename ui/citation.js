'use strict';
const {parseBacklink}=require("./backlinks");
const diff=require("diff");
const {syllabify}=require("pengine");
var PaliDiff = new diff.Diff();
PaliDiff.tokenize = PaliDiff.tokenize = value=>syllabify(value);


 const renderCitation=(cap,x0,decorations,backlink,forwardlink,quoting)=>{
	if (backlink || forwardlink || quoting) {
		const {source,target}=parseBacklink(backlink||forwardlink||quoting,cap);
		if (target.x0!=x0) return;

		const s=source.gettext();
		const e=target.gettext();
		const r=PaliDiff.diff(s.text,e.text);
		let soff=s.start-s.headerlen,eoff=e.start-e.headerlen;

		for (var i=0;i<r.length;i++){
			const R=r[i];
			if (R.removed) { //extra in s.text
				soff+=R.value.length;
			} else if (R.added) {
				decorations.push([eoff,R.value.length,'linkquote_diff']);
				eoff+=R.value.length;
			} else {
				decorations.push([eoff,R.value.length,'linkquote']);
				soff+=R.value.length;
				eoff+=R.value.length;
			}
		}
		if (decorations.length>1&&
			decorations[decorations.length-1][2]=='linkquote_diff') {
			decorations.pop();
		}
	}
}

module.exports={renderCitation};