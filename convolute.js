const {syllabify,isSyllable}=require("dengine");
const text1=` “Sādhu, bhikkhave!Sannipatitānaṃ vo, bhikkhave, dkayaṃ karaṇīyaṃ dhammī  vā kathā ariyo vā tuṇhībhāvo , Etaṃ kho, bhikkhave, tumhākaṃ patirūpaṃ kulaputtānaṃ saddhā agārasmā anagāriyaṃ pabbajitānaṃ yaṃ tumhe dhammiyā kathāya sannisīdeyyātha. Sannipatitānaṃ vo, bhikkhave, dkayaṃ karaṇīyaṃ dhammī  vā kathā ariyo vā tuṇhībhāvo”.Bhagavantameva kho no kho no kho no kho no kho no kho no`

const text2=`Sannipatitānaṃ vo, bhikkhave, dkayaṃ karaṇīyaṃ dhammī  vā kathā ariyo vā tuṇhībhāvo`




const sy2ch=(arr,sy)=>{
	let off=0,i=0;
	while (sy&&i<arr.length){
		if (isSyllable(arr[i]))sy--;
		off+=arr[i].length;
		i++;
	}
	return off;
}
const convolute=(t1,t2)=>{
	if (t2.length*3>t1.length) {
		throw "text2 too long"
	}

	let aa1=syllabify(t1),aa2=syllabify(t2);
	const arr1=aa1.filter(a=>isSyllable(a));
	const arr2=aa2.filter(a=>isSyllable(a));

	const powerup=1.1,powerdown=1.2;
	const score=[];
	for (var i=0;i<arr1.length;i++) {
		power=1;
		for (var j=0;j<arr2.length;j++) {
			if (i+j<arr1.length && arr1[i+j]==arr2[j]) {
				if (!score[i]) score[i]=0;
				score[i]+=power;
				power=power*powerup;
			} else {
				power/=powerdown;
				if (power<1)power=1;
			}
		}
	}
	const threshold= (arr2.length/4);
	let sc=score.map((s,idx)=>[s,idx]).filter(s=>s[0]>threshold);
	
	const maxscore=(1+Math.pow(powerup,arr2.length))*(arr2.length/2);

	console.log(maxscore)
	sc.sort((a,b)=>b[0]-a[1]);
	const out=[];
	for (var i=0;i<sc.length;i++){
		const off=sy2ch(aa1,sc[i][1]);
		const len=text2.length*1.2;
		const score=Math.sqrt(sc[i][0]/maxscore);
		out.push({off,len,score,s:sc[i][0]});
	}
	console.log(arr2.length)
	return out;
}
//TODO , combine overlap range

const sc=convolute(text1,text2);
print=sc=>{

	const o=sc.map(item=>[item.score,text1.substr(item.off,item.len),item.s.toFixed(2)]);
	console.log(o.join("\n"))
}
print(sc)
module.exports={convolute};