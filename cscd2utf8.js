/* convert from tipitaka-morror/cscd/romn */
const fs=require("fs");
const folder="../../tipitaka/tipitaka-mirror/romn/cscd/"
const outfolder="./cscd/";
const all=fs.readFileSync("./cscd/all.lst",'utf8').split(/\r?\n/);
const readFile=fn=>{
	let content=fs.readFileSync(folder+fn);
	const bom=content.readUInt16LE(0);
	if (bom==0xfffe) content=content.swap16();
	return content.toString('ucs2').replace('encoding="UTF-16"','encoding="UTF-8"');
}

all.forEach( fn=>{
	const content=readFile(fn);
	process.stdout.write("\r"+fn);
	fs.writeFileSync(outfolder+fn,content,'utf8');
});