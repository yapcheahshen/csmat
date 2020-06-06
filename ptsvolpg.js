//從 PTS 集冊名 取得 cscd 檔名及 PTS該頁起始頁

const pts2bk={
	mul:{
		v:[ 'vin02m2', 'vin02m3','vin01m','vin02m1','vin02m4'],
		d:['s0101m','s0102m','s0103m'],
		m:[{'s0201m':0, 's0202m':338},{ 's0202m':0,'s0203m':214},'s0203m'],
		s:['s0301m','s0302m','s0303m','0304m','s0305m'],
		a:[{'s0401m':0,'s0402m1':47,'s0402m2':101},//a1
		   's0402m3',{'s0403m1':0,'s0403m2':279},//a2,a3
		   {'s0403m3':0,'s0404m1':150,'s0404m2':351},//a4
		   {'s0404m4':0,'s0404m5':311}//a5 , part of pts 5.310 in s0404m5
		  ],
		ap:[{'s0510m1':0,'s0510m2':339}], //combine p1 and p2
		mnd:['s0515m'],//combine p1 and p2, p2 not start from 1
		ps:['s0517m','s0517m']//combine p1 and p2
	}

}
//從cscd檔名取得PTS集冊名

const bk2pts={mul: // 0 單行本，用cscd 的檔名為組名, s0515 mahaniddesa, cscd 缺culaniddesa pts頁碼, goettigen不全cullaniu 
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

const gen_bk2pts=(bk,x,y,pts)=>{
	const arr=pts.split(".");
	if (arr.length!==2) throw "invalid pts page "+pts+"at "+bk+"_x"+x+"y"+y;
	const vol=arr[0],page=arr[1];
	if (!volmap[bk]) volmap[bk]=[];
	if (volmap[bk][volmap[bk].length-1]!=vol) volmap[bk].push(vol);
}

module.exports={bk2pts};