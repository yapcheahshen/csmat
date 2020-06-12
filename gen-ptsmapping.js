//generate CSCD to PTS mapping

/*1002a03d,pb t="p3.14"

    pts page number to x.y
3:[   1.4 , 5.7 ]*/

const fs=require("fs");
const set=process.argv[2] || "mul"

const {parse,openSync}=require("dengine");
const rawtags=fs.readFileSync(set+"-rawtag.txt","utf8").split(/\r?\n/);


/*
  m10s0201   p1 338
  m10s0202   p1 339~524 , p2~213
  m11s0203   p2.214~266   p3.1~302

  m37s0510m1 pts vol1 ~ 338  , vol2 starts from 339 //
  m38s0510m2                                339~615 //
  m43s0515m pts vol1 ~257   , vol2 starts from 258
  m44       missing pts page
  m45s0517  pts has two ranges. p1 1~196 p2 1~246
*/
const volmap={};
const gen_bk_pts=(bk,x,y,pts)=>{
	const arr=pts.split(".");
	if (arr.length!==2) throw "invalid pts page "+pts+"at "+bk+"_x"+x+"y"+y;
	const vol=arr[0],page=arr[1];
	if (!volmap[bk]) volmap[bk]=[];
	if (volmap[bk][volmap[bk].length-1]!=vol) volmap[bk].push(vol);
}

const pts2cap={};

const {bk_pts}=require("./ptsvolpg");

let pbk='',maxy=0;
const combinebk={'s0510m1':true,'s0510m2':true,'s0515m':true}

const addmapping=(bk,x,y,pts)=>{
	const pv=bk_pts[set][bk];
	let singlevol=true;
	if (!pv) g=bk;
 	else {
 		m=pv.match(/^(\w+)\d+/);
 		g=m[1];
 		singlevol=false;
 	}


 	const arr=pts.split(".");
 	if (arr.length!==2) throw "invalid pts volpage" +pts;

 	if (combinebk[bk]){
 		g=bk;
 		singlevol=true;
 	}

 	let vol=parseInt(arr[0]);
 	const page=parseInt(arr[1]);
 	if (isNaN(vol) || isNaN(page)) throw "invalid pts volpage"+pts;

 	if (vol>0) vol--;

 	if (!pts2cap[g]) pts2cap[g]=[];
 	if (!singlevol&&!pts2cap[g][vol]) pts2cap[g][vol]=[];
 	
 	const VPG=singlevol?pts2cap[g]:pts2cap[g][vol];

 	if (VPG[page]){
 		console.log("WARNING repeating volpage",pts,bk,x);
 	}
 	if (y>maxy)maxy=y;
 	
 	if (VPG.length&& page&& !VPG[page-1]) {
 		console.log("page number gap ",((vol?vol+1:vol)+"."+(page-1)),'at',bk,"line",x+1);
 	}

 	VPG[page]=x+(y?"y"+y:'');
}	
const db=openSync(set);
rawtags.forEach(tag=>{
	const at=tag.indexOf(",");
	const capaddr=tag.substr(0,at);
	const m=tag.substr(at+1).match(/p(\d\.\d+)/);
	if (m){
		const cap=parse(capaddr,db);
		
		//  generate ptsvolpg.js
		//gen_bk_pts(cap.bk,cap.bk0,cap.y,m[1])
		addmapping(cap.bk,cap.bk0,cap.y,m[1]);
	}
})

const write=()=>{
	//save 20%
	for (var g in pts2cap) {
		if (Array.isArray(pts2cap[g][0])) {
			pts2cap[g]=pts2cap[g].map(arr=>arr.join(","));
		} else {
			pts2cap[g]=pts2cap[g].join(",");
		}
	}
	const fn=set+"-pts.txt";
	console.log("write to",fn);
	str=JSON.stringify(pts2cap).replace(/null,/g,',');
	fs.writeFileSync(fn,str,"utf8");	
}
//console.log(volmap)
write();


/* gap , need checking
page number gap  4.210 at vin02m1 line 2149  //缺 208~210
page number gap  2.263 at s0102m line 911  fixed in errata.js
page number gap  3.329 at s0103m line 1002 fixed in errata.js
page number gap  3.230 at s0103m line 1010 fixed in errata.js
page number gap  4.107 at s0304m line 719 fixed in errata.js
page number gap  5.140 at s0305m line 824 fixed in errata.js
page number gap  0.20 at s0506m line 201
page number gap  0.47 at s0506m line 533
page number gap  0.75 at s0506m line 791
page number gap  0.99 at s0506m line 1005
page number gap  0.133 at s0506m line 1268
page number gap  0.31 at s0507m line 309
page number gap  0.38 at s0507m line 386
page number gap  0.46 at s0507m line 454
page number gap  0.52 at s0507m line 518
page number gap  0.78 at s0507m line 765
page number gap  0.84 at s0507m line 849
page number gap  0.32 at s0520m line 193
page number gap  0.192 at s0520m line 751


page number gap  0.160 at s0502a line 360   空頁
page number gap  0.244 at s0512a line 1191  242, 245, 243 ,244, 256 //245跳號
page number gap  2.117 at s0513a2 line 539   缺，待查原書
page number gap  6.329 at s0514a2 line 1062  6.130 跳到 6.330 
page number gap  6.156 at s0514a3 line 9     6.157~6.330 在這裡
*/