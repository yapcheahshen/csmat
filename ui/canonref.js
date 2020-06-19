'use strict';

const Vin={
vin01m:'vb1',vin02m1:'vb2',vin02m2:'mv',vin02m3:'cv',vin02m3:'pvr'
}
const Nikaya={1:'dn',2:'mn',3:'sn',4:'an'};
const KN={1:'Kp',2:'dhp',3:'ud', 4:'iti',5:'snp', 
6:'vv',7:'pv',8:'thag',9:'thig',10:'ap',11:'bv',
12:'cp',13:'ja1',14:'ja2',15:'mnd',16:'cnd',17:'ps',18:'mil'
,19:'ne',20:'pe',
 }
 const Abhi={
 	abh01:'ds',abh02m:'vb',abh03m1:'dt',abh03m2:'pp',abh03m3:'kv',
 	abh03m4:'ya1',abh03m5:'ya2',abh03m6:'ya3',
 	abh03m7:'pt1',abh03m8:'pt2',abh03m9:'pt3',abh03m10:'pt4',abh03m11:'pt5',
 }
 const E={
 	e0101n:'vism1',e0102n:'vism2',e0103n:'vism-t1',e0104n:'vism-t2'
 }
const canonrepl=[
	[/(vin\d\d[mat]\d?)/ ,(m,bk)=> Vin[bk]? Vin[bk]:m],
	[/(abhi\d\d[mat]\d?)/,(m,bk)=>Abhi[bk]?Abhi[bk]:m],
	[/(e\d+\w)/          ,(m,bk)=>   E[bk]?   E[bk]:m],
	
	[ /s0(\d)(\d\d)([mat])(\d?)/,(m,nk,vol,set,part)=>{
		if (!Nikaya[nk]) return m;
	  	return Nikaya[nk]+parseInt(vol)+((set=='m')?'':"-"+set)+part
	}],
	[/s05(\d\d)([mat])(\d?)/,(m,vol,set,part)=>{
		vol=parseInt(vol);
		if (!KN[vol]) return m;
		return KN[vol]+((set=='m')?'':"-"+set)+part
	}],

]

const makecanonref=cap=>{
	let bk=cap.bk;
	for (var i=0;i<canonrepl.length;i++) {
		const newbk=bk.replace(canonrepl[i][0],canonrepl[i][1])
		if (newbk&&newbk!==bk) return newbk+"_"+cap._;
	}
	return bk+"_"+cap._;
}
module.exports={makecanonref}