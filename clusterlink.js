const fs=require("fs");
const {openSync}=require("dengine");
const links=fs.readFileSync('./link-parsed.txt',"utf8").split(/\r?\n/);
const muldb=openSync("mul");
const {parseId}=require("./fetch");
const linkpat=/(\S+m\d?)p(\d+)/
const {filename2bookseq,bookseq2filename}=require("./bookseq");
const titles=[];
for (var i=0;i<links.length;i++){
	const link=links[i]
	const lnk=link.split("<=");
	const target=lnk[0],from=lnk[1];
	const m=target.match(linkpat);
	if (!m) continue;

	const file=m[1],paranum=parseInt(m[2]);
	const seq=filename2bookseq(file);
	const o=parseId(muldb, {rawid:seq+","+paranum})
	
	const anc=muldb.gettocancestor(o.prefix);

	const ancestor=anc.filter(item=>item[0]!="-").map(item=>{
		let t=item[0];
		if (t.indexOf("|")>-1) t=t.substr(t.indexOf("|")+1);
		return t;
	}).join("/")
	
	titles.push([ ancestor  ,parseInt(seq.substr(3)),paranum])
	
};
titles.sort((a,b)=> a[1]==b[1]?( b[2]==a[2]?0:b[2]-a[2]  ): a[1]-b[1]);
const out={};
let prev='',count=0;
for (var i=0;i<titles.length;i++){
	const t=titles[i]
	if (prev&&t[0]!=prev){
		out[prev]=count;
		count=0;
	}
	count++;
	prev=t[0];
}
out[prev]=count;
const out2=[];
for (var t in out) {
	out2.push( [t,out[t]]);
}
out2.sort((a,b)=>b[1]-a[1]);
fs.writeFileSync("linksource.txt",out2.join("\n"),"utf8")
