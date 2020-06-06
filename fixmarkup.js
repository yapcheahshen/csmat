/*
   .<p rend="bodytext" n="387-9"> => <p rend="bodytext" n="387-389">

   . inline () and [ ] note

	<note a>  original note markup found in cscd, nullify

	<note b=""> <n b=""> converted from []

	<note c=""> <n c=""> converted from ()
*/
const {dofiles,getfiles}=require("./dofile");
const {isPaliword,palialpha}=require("dengine");
const folder="./cscd-book/";
const errata=require("./errata");
const files=getfiles(folder);
const fs=require("fs");
const outfolder="./raw/"
const set=process.argv[2] || "mul"
const maxfile=parseInt(process.argv[3],0);
const writetodisk=true;
const finalfixes=[
	[/<p rend="bodytext">/g,"<p>"]
	,[/<p PN="(\d+)"><\/p>\n<p>/g,'<p pn="$1">'] //empty p with hangnum, 
	,[/;;<gbrk\/>/g,";<gbrk/>"]
	,[/<p rend="title"><note c="(.+?)"\/><\/p>/g,
	'<p rend="title">($1)</p>'
	],
	[/<p rend="subhead"><note c="(.+?)"\/><\/p>/g,
	'<p rend="subhead">($1)</p>']
]
const startingfixes=[
	[/\n\n<p /g,"\n<p "],
	//[/<hi rend="bold"><(.+?)>([^<]+?)<\/hi>/g,"<$1>{$2}"], //move tag out
	[/<hi rend="bold"><\/hi>/g,""],
	[/<hi rend="bold">([^\n]+?)<\/hi>/g,"{$1}"],

	[/<p rend="hangnum" n="(\d+)"><hi rend="paranum">(\d+)<\/hi><hi rend="dot">.<\/hi><\/p>\n\n<p rend="bodytext">/g,
	'<p rend="bodytext" n="$1"><hi rend="paranum">$2<\/hi><hi rend="dot">.<\/hi>'], //
	[/<hi rend="dot">\.<\/hi>/g,"."]
]

const removeparanum=(content,fn)=>{
	content=content.replace(/<p rend="bodytext" n="([\-\d]+)"><hi rend="paranum">([\d\-]+)<\/hi>\. ?/g,
		(m,m1,m2)=>{
			if (m1!=m2) throw "paranum unmatch "+m1+"<>"+m2+" ,"+fn;
			return '<p pn="'+m1+'">';
	});
	content=content.replace(/<p rend="hangnum" n="([\-\d]+)"><hi rend="paranum">([\d\-]+)<\/hi>\. ?/g,
		(m,m1,m2)=>{
			if (m1!=m2) throw "hanganum unmatch "+m1+"<>"+m2+" ,"+fn;
			return '<p PN="'+m1+'">';
	});
	return content;
}
const alphas={"Ka":1,"Kha":2,"Ga":3,"Gha":4,"Ṅa":5,
				"Ca":6,"Cha":7,"Ja":8,"Jha":9,"Ña":10,
				"Ṭa":11,"Ṭha":12,"Ḍa":13,"Ḍha":14,"Ṇa":15,
				"Ta":16,"Tha":17,"Da":18,"Dha":19,"Na":20,
				"Pa":21,"Pha":22,"Ba":23,"Bha":24,"Ma":25,
				"Ya":26,"Ra":27,"La":28,"Va":29,"Sa":30,"Ha":31}
const bracket2markup=(content,fn)=>{
	//content=content.replace(/\(([^\d\s]+?)\)/g,'<note C="$1"/>');
//(1234) , (Ka) cannot contain links
	content=content.replace(/\(([^<]+?)\)/g,(m,m1)=>
		(parseInt(m1).toString()==m1||alphas[m1])?m:'<note c="'+m1+'"/>');
	content=content.replace(/\[([^<]+?)\]/g,(m,m1)=>
		(parseInt(m1).toString()==m1||alphas[m1])?m:'<note b="'+m1+'"/>');
	return content;
}
const reverse_bracket2markup=s=>{
	s=s.replace(/<note b="(.+?)"\/>/gi,"[$1]");
	s=s.replace(/<note c="(.+?)"\/>/gi,"($1)");
	return s;
}
const nullify=(content,fn)=>{
	content=bracket2markup(content,fn);
	return content.replace(/<note>(.+?)<\/note>/g,(m,m1)=>{
		if (m1.indexOf("<")>-1) { //has inner tag
			m1=reverse_bracket2markup(m1);
		}
		if (m1.indexOf('"')>-1) {
			throw fn+"nullify: has qoute "+m1
		}
		if (m1.indexOf("<")>-1) {
			throw fn+"nullify: has tag "+m1
		}
		return '<note a="'+m1+'"/>';
	});
}
//gatha should be in same <p> , for better semantic match
const groupgatha=(content,fn)=>{
	let s=content;
	s=s.replace(/<\/p>\n<p rend="gatha2">/g,";<gbrk/>");
	s=s.replace(/<\/p>\n<p rend="gatha3">/g,";<gbrk/>");
	s=s.replace(/<\/p>\n<p rend="gathalast">/g,";<gbrk/>");
	s=s.replace(/<p rend="gatha1">/g,'<p rend="gatha">');

	//combine with empty <p>
	s=s.replace(/<p ([^<]+?)><\/p>\n<p rend="gatha">/g,'<p rend="gatha" $1>');
	//only with a null tag, pg
	s=s.replace(/<p ([^<]+?)><([^<]+?)><\/p>\n<p rend="gatha">/g,'<p rend="gatha" $1><$2>');

	return s;
}


/*
const alphanum=(content,fn)=>{
	//assume not in <note>

	//const maxalpha="Dha"; in cscd set
	content=content.replace(/\[([KGṄCJÑṬḌṆTDNPBMYRLVSH]h?a)\] ?/g,(m,m1)=>{
		return '<n b="'+m1+'"/>';})
	content=content.replace(/\(([KGṄCJÑṬḌṆTDNPBMYRLVSH]h?a)\) ?/g,(m,m1)=>{
		return '<n c="'+m1+'"/>';})
	return content;
}
*/
const backmovepb=(content,fn)=>{
	const pb='<pb ed="(.)" n="([^\"]+?)" ?/>';
	const ch=palialpha+'}…‘’,';
	const pat4=new RegExp('({?['+ch+']+) ?'+pb+pb+pb+pb,'gi');
	const pat3=new RegExp('({?['+ch+']+) ?'+pb+pb+pb,'gi');
	const pat2=new RegExp('({?['+ch+']+) ?'+pb+pb,'gi');
	const pat1=new RegExp('({?['+ch+']+) ?'+pb,'gi');

	content=content.replace(pat4,(m,w,ed1,n1,ed2,n2,ed3,n3,ed4,n4)=>{
		n1=n1.replace(/\.0+/,".");n2=n2.replace(/\.0+/,".");
		n3=n3.replace(/\.0+/,".");n4=n4.replace(/\.0+/,".");
		ed1=ed1.toLowerCase();ed2=ed2.toLowerCase();ed3=ed3.toLowerCase();ed4=ed4.toLowerCase();
		return '<pb t="'+ed1+n1+';'+ed2+n2+';'+ed3+n3+';'+ed4+n4+'"/>'+w;
	})
	content=content.replace(pat3,(m,w,ed1,n1,ed2,n2,ed3,n3)=>{
		n1=n1.replace(/\.0+/,".");n2=n2.replace(/\.0+/,".");n3=n3.replace(/\.0+/,".");
		ed1=ed1.toLowerCase();ed2=ed2.toLowerCase();ed3=ed3.toLowerCase();
		return '<pb t="'+ed1+n1+';'+ed2+n2+';'+ed3+n3+'"/>'+w;
	})
	content=content.replace(pat2,(m,w,ed1,n1,ed2,n2)=>{
		n1=n1.replace(/\.0+/,".");n2=n2.replace(/\.0+/,".");
		ed1=ed1.toLowerCase();ed2=ed2.toLowerCase();
		return '<pb t="'+ed1+n1+';'+ed2+n2+'"/>'+w;
	})
	content=content.replace(pat1,(m,w,ed1,n1)=>{
		n1=n1.replace(/\.0+/,".");
		ed1=ed1.toLowerCase();
		return '<pb t="'+ed1+n1+'"/>'+w;
	});

	//not moved, capitalize attribute name
	const upat4=new RegExp(pb+pb+pb+pb,'g');
	const upat3=new RegExp(pb+pb+pb,'g');
	const upat2=new RegExp(pb+pb,'g');
	const upat1=new RegExp(pb,'g');

	content=content.replace(upat4,(m,ed1,n1,ed2,n2,ed3,n3,ed4,n4)=>{
		n1=n1.replace(/\.0+/,".");n2=n2.replace(/\.0+/,".");
		n3=n3.replace(/\.0+/,".");n4=n4.replace(/\.0+/,".");
		ed2=ed2.toLowerCase();ed2=ed2.toLowerCase();ed3=ed3.toLowerCase();ed4=ed4.toLowerCase();
		return '<pb T="'+ed1+n1+';'+ed2+n2+';'+ed3+n3+';'+ed4+n4+'"/>';
	});
	content=content.replace(upat3,(m,ed1,n1,ed2,n2,ed3,n3)=>{
		n1=n1.replace(/\.0+/,".");n2=n2.replace(/\.0+/,".");n3=n3.replace(/\.0+/,".");
		ed2=ed2.toLowerCase();ed2=ed2.toLowerCase();ed3=ed3.toLowerCase();
		return '<pb T="'+ed1+n1+';'+ed2+n2+';'+ed3+n3+'"/>';
	});
	content=content.replace(upat2,(m,ed1,n1,ed2,n2)=>{
		n1=n1.replace(/\.0+/,".");n2=n2.replace(/\.0+/,".");
		ed2=ed2.toLowerCase();ed2=ed2.toLowerCase();
		return '<pb T="'+ed1+n1+';'+ed2+n2+'"/>';
	});
	content=content.replace(upat1,(m,ed1,n1)=>{
		n1=n1.replace(/\.0+/,".");
		ed1=ed1.toLowerCase();
		return '<pb T="'+ed1+n1+'"/>';
	});

	return content;
}
const validate=(content,fn)=>{
	if (content.indexOf('rend="bold"')>-1) {
		console.log('still have rend="bold"',fn);
	}
	if (content.indexOf('rend="dot"')>-1) {
		console.log('still have rend="dot"',fn);
	}
}
const checkparagraph=(content,fn)=>{
	let pcount=0;
	const lines=content.split(/\n/);
	for (let i=1;i<lines.length-1;i++) {
		const l=lines[i];
		if ((l.substr(0,2)!=="<p") || (l.substr(l.length-4,4)!=="</p>")) {
			console.log("the line should enclosed by <p>",fn,"::",i);
		} else {
			pcount++;
		}
	}
	return pcount;
}
const doit=()=>{
	const farr=files[set]//.filter(f=>f[0]=="a");
	if (maxfile) farr.length=maxfile;
	dofiles(farr,(content,fn)=>{

		content=content.replace(/\r?\n/g,"\n");

		const hotfix=errata[fn.substr(3)];
		if (hotfix) {
			hotfix.forEach(r=>content=content.replace(r[0],r[1]));
			delete errata[fn.substr(3)];
		}

		startingfixes.forEach(r=>content=content.replace(r[0],r[1]));

		const jobs=[nullify,removeparanum,groupgatha,backmovepb];
		jobs.forEach(job=>{content=job(content,fn)});

		finalfixes.forEach(r=>content=content.replace(r[0],r[1]));

		
		validate(content,fn);
		const pcount=checkparagraph(content,fn);
		process.stdout.write("\r"+fn+"  "+pcount+"  ");
		if (writetodisk) fs.writeFileSync(outfolder+fn,content,"utf8");
		
	});

	if (set=='*'&&Object.keys(errata).length){
		console.log("unconsumed errata", Object.keys(errata))
	}
}
module.exports={backmovepb,removeparanum,groupgatha,nullify};
const at=process.argv[1].indexOf("fixmarkup");
const test=process.argv[1].indexOf("test");
if (at>0&&test==-1) doit();