const fs=require("fs");

let multag=fs.readFileSync("mul-rawtag.txt","utf8").split(/\r?\n/);
let atttag=fs.readFileSync("att-rawtag.txt","utf8").split(/\r?\n/);
let tiktag=fs.readFileSync("tik-rawtag.txt","utf8").split(/\r?\n/);

mulnote=multag.filter(item=>item.indexOf("note ")>-1);
attnote=atttag.filter(item=>item.indexOf("note ")>-1);
tiknote=tiktag.filter(item=>item.indexOf("note ")>-1);
const patterns=[
	/dī. [āīūḷṁṃñṇṅṭḍa-y\.]+ [āīūḷṁṃñṇṅṭḍa-y\.]+ ?ṭī\.? [\-\d\.]+/gi,
	/cūḷani\. [āīūḷṁṃñṇṅṭḍa-y\.]+ [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ [āīūḷṁṃñṇṅṭḍa-y\.]+ ?ṭī\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ [āīūḷṁṃñṇṅṭḍa-y\.]+ ?aṭṭha\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ [a-y][āai]\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ ?ni\. aṭṭha\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ ?aṭṭha\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ ?ni\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ ?ṭī\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y]+\. [āīūḷṁṃñṇṅṭḍa-y\.]+ [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ [\-\d\.]+/gi,
]
const links=[];
const translatelink=[]

const listpat=(lines,set)=>{
	for (var i=0;i<lines.length;i++){
		let line=lines[i];
		const at=line.indexOf(",");
		mataddr=parseInt('0x'+line.substr(0,at));
		
		patterns.forEach(pat=>{
			line=line.replace(pat,m=>{
				let translated=recognize([m,mataddr],set,mataddr);
				if (translated) {
					translatelink.push([mataddr,translated]);
				}
				links.push([m,mataddr]);
				return "";
			});
		});		
	}

};
const {humanlink}=require("./mataddr");
const pattern=require("./linkpattern");
let recognized=0;
const unregconized=[];

const recognize=(link,set,mataddr)=>{
	let res='',ok=false,lastpat;
	for (var i=0;i<pattern.length;i++){
		const pat=pattern[i];
		const m=link[0].match(pat[0]);
		if (m) {
			const o=pat[1]( m[1]);
			if (typeof o=="string"){
				ok=true;
				res=o;
			} else {
				if (o) console.log("cannot parse ",link,'to',humanlink(set,mataddr),'code',o);	
			}
			break; //try the first match pattern , /ma. ni./ fail and do not try /a. ni./
		}
	}
	if (ok) {
		recognized++;
	} else {
		unregconized.push(link);
	}
	return res;
}
console.log("extract links from rawtag")
listpat(mulnote,'mul');
listpat(attnote,'att');
listpat(tiknote,'tik');
links.sort();
console.log("number of links",links.length)

fs.writeFileSync("all-links.txt",links.join("\n"),"utf8")
fs.writeFileSync("tra-links.txt",translatelink.join("\n"),"utf8")
fs.writeFileSync("unregconized.txt",unregconized.join("\n"),"utf8")
console.log("recognized",recognized, (recognized*100/links.length).toFixed(2)+"%");