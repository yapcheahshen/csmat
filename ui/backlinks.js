const BACKLINKSEP="|";
const {parseCAP}=require("pengine");
const {makecanonref}=require("./canonref");
const createBacklinkCard=(h,props)=>{
	if (!props.show) {
		return h('backlinkbtn',{props})
	}
	let addr=props.link;
	const cardcommand=props.cardcommand;
	const command=arg=>{
		if (arg=="close") {
			props.command("setbacklink",'');
			return;
		}
		props.command(arg);
	}
	const depth=(props.depth||0)+1;
	const from=props.cap;
	const at=addr.indexOf(BACKLINKSEP);
	if (at>-1) addr=addr.substr(0,at);
	const cap=parseCAP(addr);
	const label=makecanonref(cap);

	return h("card",{props:{depth,command,from,displayline:-1,cardcommand,addr}});
}
const getintextbacklinks=(allbacklinks,cap)=>{
	if (!allbacklinks)return {};
	const backlinks=allbacklinks.filter(itm=>itm[1].indexOf(BACKLINKSEP)>0);
	const out={};
	if (backlinks&&backlinks.length){
		for (let i=0;i<backlinks.length;i++) {
			const sourcedb=backlinks[i][0];
			const at=backlinks[i][1].indexOf(BACKLINKSEP);
			const sourceaddr=backlinks[i][1].substr(0,at);
			const targetaddr=backlinks[i][1].substr(at+1);
			
			const tcap=parseCAP(  cap.bk+"_"+cap._+targetaddr , cap.db); 
			if (!out[tcap.x0])out[tcap.x0]=[];
			out[tcap.x0].push(sourcedb+"@"+backlinks[i][1]);
		}
	}
	return out;
}

const parseBacklink=(addr,cap)=>{
	const at=addr.indexOf(BACKLINKSEP);
	const sourceaddr=addr.substr(0,at);
	const targetaddr=cap.bk+"_"+cap._+addr.substr(at+1);
	const source=sourceaddr?parseCAP(sourceaddr):cap;
	const target=parseCAP(targetaddr);
	return {source,target}
}
module.exports={getintextbacklinks,createBacklinkCard,parseBacklink};