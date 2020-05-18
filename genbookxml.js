/* combine small files to one book per file*/

const {dofiles,getfiles}=require("./dofile");
const files=getfiles("./cscd/");
const fs=require("fs");

const set=process.argv[2] || "mul"
const setcount={};
let lastfn='';

const Newbook={
	'abh02t.tik18.xml':'abh02t1.0.xml',
	'abh03t.tik0.xml':'abh02t2.0.xml', //vibhanga

	'abh03t.tik1.xml':'abh03t1.0.xml', //Dhātukathā
	'abh03t.tik2.xml':'abh03t2.0.xml', //Puggalapaññatti
	'abh03t.tik3.xml':'abh03t3.0.xml',//Kathāvatthu
	'abh03t.tik4.xml':'abh03t4.0.xml',//yamaka
	'abh04t.nrf0.xml':'abh03t5.0.xml',//patthana

	'abh03a.att3.xml':'abh03a1.0.xml',//Dhātukathā
	'abh03a.att6.xml':'abh03a2.0.xml',//Puggalapaññatti
	'abh03a.att39.xml':'abh03a3.0.xml',//Kathāvatthu
	'abh03a.att50.xml':'abh03a4.0.xml',//yakama
	'e0103n.att0.xml':'abh03a5.0.xml', //patthana

	's0402a.att19.xml':'s0402a1.0.xml',
	's0402a.att36.xml':'s0402a2.0.xml',
	's0403a.att0.xml' :'s0402a3.0.xml',

	's0402t.tik18.xml':'s0402t1.0.xml',
	's0402t.tik34.xml':'s0402t2.0.xml',
	's0403t.tik0.xml' :'s0402t3.0.xml',


	's0403a.att26.xml':'s0403a1.0.xml',
	's0403a.att39.xml':'s0403a2.0.xml',
	's0404a.att0.xml':'s0403a3.0.xml',

	's0404a.att10.xml':'s0404a1.0.xml',
	's0404a.att15.xml':'s0404a2.0.xml',
	's0404a.att31.xml':'s0404a3.0.xml',
	's0501a.att0.xml' :'s0404a4.0.xml',

	's0403t.tik23.xml':'s0403t1.0.xml',
	's0403t.tik33.xml':'s0403t2.0.xml',
	's0404t.tik0.xml' :'s0403t3.0.xml',

    's0404t.tik8.xml':'s0404t1.0.xml',
	's0404t.tik13.xml':'s0404t2.0.xml',
	's0404t.tik26.xml':'s0404t3.0.xml',
	's0501t.nrf0.xml' :'s0404t4.0.xml'
}
const combinedfilename=fn=>{
	let prefix='';
	if (fn.indexOf(".mul")>-1) prefix='mul';
	if (fn.indexOf(".att")>-1) prefix='att';
	if (fn.indexOf(".tik")>-1) prefix='tik';
	if (fn.indexOf(".nrf")>-1) prefix='nrf';

	//higher priority
	if (fn.match(/^s\d+m/)) prefix='mul'; //s0520m.nrf is mul
	if (fn.match(/^s\d+a/)) prefix='att';
	if (fn.match(/^s\d+t/)) prefix='tik';

	if (fn.match(/^vin\d+t/)) prefix='tik';
	if (fn.match(/^abh\d+t/)) prefix='tik';
	if (fn.match(/^abh\d+a/)) prefix='att';

	if (!setcount[prefix]) setcount[prefix]=0;
	setcount[prefix]++;
	let n="00"+setcount[prefix];
	n=n.substr(n.length-2);


	return prefix[0]+n+fn.replace(/\.\S+\.xml/,'.xml');
}
const isnewbook=(fn)=>{
	if (!lastfn)return false;

	if (Newbook[fn]) {
		return combinedfilename(Newbook[fn]);
	}

	let at=fn.indexOf(".")
	fn=fn.substr(0,at);
	at=lastfn.indexOf(".");
	if (lastfn.substr(0,at)!=fn) {
		return combinedfilename(lastfn) 
	}
	return false;
}
const trimbody=content=>{
	let at=content.indexOf("<body>");
	content=content.substr(at+7);
	at=content.indexOf("</body>");
	content=content.substr(0,at-1);
	return content;
}
let outcontent='';
const writebook=(outfn)=>{
	if (!outfn) throw 'missing output filename';
	outcontent='<cscd fn="'+outfn+'">'+outcontent+"</cscd>";
	console.log(outfn,outcontent.length);
	fs.writeFileSync("./cscd-book/"+outfn,outcontent,'utf8');
	outcontent='';
}
const genbookxml=files=>{
	dofiles(files,(content,fn)=>{
		content=trimbody(content);
		const newbookname=isnewbook(fn);
		if (newbookname) writebook(newbookname);
		outcontent+=content;
		lastfn=fn;
	});	
}

genbookxml(files[set]);

writebook(isnewbook(lastfn)?isnewbook(lastfn):combinedfilename(lastfn));