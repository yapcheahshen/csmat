const fs=require("fs");
let folder="./cscd-book/";
const sets=['mul','att','tik','nrf'];

const dofiles=(f,cb)=>{
	const max=f.length;
	for (let i=0;i<max;i++) {
		const fn=f[i]
		let content=fs.readFileSync(folder+fn,'utf8');
		cb(content, fn);
	}
}
const getfiles=fo=>{
	folder=fo;
	const files={}
	sets.forEach(s=>{
		files[s]=fs.readFileSync(folder+s+".lst","utf8").trim().split(/\r?\n/);
	})
	let allfiles=[];
	sets.filter(s=>s!=='nrf').forEach(s=>allfiles=allfiles.concat(files[s]));

	files["mat"]=allfiles;

	files["*"]=allfiles.concat(files.nrf);
	return files;
}
module.exports={dofiles,getfiles};