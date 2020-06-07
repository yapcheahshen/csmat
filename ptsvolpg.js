//從 PTS 集冊名 取得 cscd 檔名及 PTS該頁起始頁
const {open,openSync,parseCAP}=require("dengine");
const pts_bk={
	mul:{
		v:[ 'vin02m2', 'vin02m3','vin01m','vin02m1','vin02m4'],
		d:['s0101m','s0102m','s0103m'],
		m:[[['s0201m',0,] ,['s0202m',338]],[['s0202m',0],['s0203m',214]],'s0203m'],
		s:['s0301m','s0302m','s0303m','0304m','s0305m'],
		a:[[['s0401m',0],['s0402m1',47],['s0402m2',101]],//a1
		   's0402m3',[['s0403m1',0],['s0403m2',279]],//a2,a3
		   [['s0403m3',0],['s0404m1',150],['s0404m2',351]],//a4
		   [['s0404m4',0],['s0404m5',311]]//a5 , part of pts 5.310 in s0404m5
		  ],
		ap:[['s0510m1',0],['s0510m2',339]], //combine p1 and p2
		mnd:['s0515m'],//combine p1 and p2, p2 not start from 1
		ps:['s0517m']//combine p1 and p2
	},
	att:{

		j:['s0513a1','s0513a2','s0513a3','s0513a4', 
		  [['s0513a4',0],['s0514a1',108]],'s0514a2', 
	 	  [['s0514a2',0],['s0514a3',129],['s0514a2',329],['s0514a3',478]]
		],

	}
}
//從cscd檔名取得PTS集冊名

const bk_pts={mul: // 0 單行本，用cscd 的檔名為組名, s0515 mahaniddesa, cscd 缺culaniddesa pts頁碼, goettigen不全cullaniu 
{vin01m: "v3",  vin02m1: "v4",  vin02m2: "v1",  vin02m3: "v2",  vin02m4: "v5",
  s0101m: "d1",  s0102m: "d2",  s0103m: "d3",
  s0201m: "m1",  s0202m: "m1-2",  s0203m: "m2-3",
  s0301m: "s1",  s0302m: "s2",  s0303m: "s3",  s0304m: "s4",  s0305m: "s5",
  s0401m: "a1",  s0402m1: "a1",  s0402m2: "a1",  s0402m3: "a2",  
  s0403m1: "a3",  s0403m2: "a3",  
  s0403m3: "a4",   s0404m1: "a4",  s0404m2: "a4",  
  s0404m3: "a5",  s0404m4: "a5",
  s0501m: 0,  s0502m: 0,  s0503m: 0,  s0504m: 0,  s0505m: 0,  s0506m: 0,  s0507m: 0,  s0508m: 0,  s0509m: 0,
  s0510m1: "ap1-2",  s0510m2: "ap2",  s0511m: 0,  s0512m: 0,  
  s0515m: "mnd1-2",  s0517m: "ps1-2",
  s0518m: 0,  s0519m: 0,  s0520m: 0,  abh01m: 0,  abh02m: 0,  abh03m1: 0,  abh03m2: 0,  abh03m3: 0} 

,att:{vin01a:'v1-3', vin02a1:'v4',  vin02a2:'v5', vin02a3:'v6', vin02a4:'v7',
  s0101a:'d1-2',s0102a:'d2-3', s0103a:'d3',  
  s0201a:'m1-2', s0202a: 'm3' , s0203a: 'm4-5',
  s0301a: 's1', s0302a: 's2', s0303a: 's2', s0304a: 's2-3', s0305a: 's3' ,
  s0401a: 'a1-2',s0402a1:'a2',s0402a2:'a2',
  s0402a3:'a3',s0403a1:'a3',s0403a2:'a3',
  s0403a3:'a4',s0404a1:'a4', s0404a2:'a4', 
  s0404a3:'a5', s0404a4:'a5',
  s0501a: 0, s0502a: 'dp1-4' , s0503a: 0,  s0504a:'iti1-2', s0505a: 'snp1-2',
  s0506a: 0,  s0507a: 0, s0508a1: 'thag1-2',  s0508a2: 'thag2-3',
  s0509a: 0, s0510a: 0,  s0511a: 0,  s0512a: 0,
  s0513a1: 'j1', s0513a2: 'j2',  s0513a3: 'j3',  s0513a4: 'j4-j5',
  s0514a1: 'j5',  s0514a2: 'j6',  s0514a3: 'j6',
  s0515a: 'mnd1-2',  s0516a: 0,  s0517a: 'ps1-3',
  abh01a: 0,  abh02a: 0,  abh03a1: 0,  abh03a2: 0,  abh03a3: 0,  abh03a4: 0},
 tik:{vin04t:  0 , s0101t: 's1' ,s0102t:'s2',s0103t:'s3',abh06t:0 }
}
const latin2num={i:1,ii:2,iii:3,iv:4,v:5,vi:6,vii:7,viii:8,ix:9};
const parsePTS=pts=>{
	let vol,page,bk,P,singlevol=false;
	for (var p=0;p<refpats.length;p++) {
		P=refpats[p];
		const m=pts.match(P.pat);
		if (!m)continue;

		vol=m[1],page=m[2];
		if (!page) {page=vol,vol=0,singlevol=true}

		const bkg=pts_bk[P.db][P.g];
		if (!bkg) {
			console.log("unknown book",pts);
			return;
		}

		vol=latin2num[vol];
		if (isNaN(vol)){
			console.log("wrong vol",pts);
			return;
		}
		vol--;

		bk=bkg[vol];
		
		if (!bk) {
			console.log(bkg,vol)
			console.log("wrong book",pts);
			return;
		}

		break;
	}
	const db=open(P.db);
	//console.log(db.getaux())
	const ptsvolpg=db.getaux().ptsvolpg;
	if (!ptsvolpg) {
		throw "not pts mapping in db"
		return;
	}

	let VPG=singlevol?ptsvolpg[P.g]:ptsvolpg[P.g][vol];
	if (typeof VPG=="string"){
		if (singlevol) {
			ptsvolpg[P.g]=VPG=VPG.split(",");
		} else {
			ptsvolpg[P.g][vol]=VPG=VPG.split(",");
		}
	}
	if (!VPG[page]) {
		console.log("no such page",pts);
		return null;
	}
	
	//bk might be a range
	if (typeof bk=="object") {
		const ranges=bk;
		for (let i=0;i<ranges.length;i++){
			const R=ranges[i];
			if (page>R[1]) bk=R[0];
		}
	}
	const cap=parseCAP(bk+"_x"+VPG[page])
	return cap.stringify();
}
const refpats=[
	{pat:/Vin\.([iv]{1,3})\.(\d+)/, g:'v',db:'mul'},
	{pat:/DN\.([i]{1,3})\.(\d+)/	, g:'d',db:'mul'},
	{pat:/MN\.([i]{1,3})\.(\d+)/	, g:'m',db:'mul'},
	{pat:/SN\.([iv]{1,3})\.(\d+)/	, g:'s',db:'mul'},
	{pat:/AN\.([iv]{1,3})\.(\d+)/	, g:'a',db:'mul'},

	{pat:/Ja\.([iv]{1,3})\.(\d+)/	, g:'j',db:'mul'},

	{pat:/Snp\.(\d+)/,g:'s0505m'	,db:'mul'},
	//{pat:/Snp-a\.(\d+)/,g:'s0505a',db:'att'},
	{pat:/Ja-a\.([iv]{1,3})\.(\d+)/	, g:'j',db:'att'},
]
const dotest=()=>{
	let failed=0,passed=0;
	const assert=(a,b,testname)=>{
		if (a!==b) {
			testname&&console.log('test:',testname);
			console.log('expecting',a);
			console.log('got',b);
			failed++;		
		} else passed++;
	}
	const testdata=[
		["Vin.iii.1","vin01m_p1"],
		["Vin.iii.2","vin01m_p2y55"],
		["MN.i.338","s0201m_p513x4"],
		["MN.i.339","s0202m_p1"],

		["Ja-a.i.1","s0513a1_x5"],
		["Ja-a.iv.1","s0513a4_x7"],
		["Ja-a.v.1","s0513a4_x7"], //not passed yet
		//test all ranges
	]

	openSync("mul");
	openSync("att")

	testdata.forEach(item=>{
		assert(item[1], parsePTS(item[0]));
	})
	console.log("passed",passed,"failed",failed)
}

if (typeof process!=="undefined" &&process.argv.length>1){

	dotest();
}

//todo , give cap, return PTS page with percentage

module.exports={bk_pts,pts_bk, parsePTS};