const {syllabify,isSyllable}=require("./paliutil");

const data=[
["Namo tassa bhagavato arahato sammāsambuddhassa",18]
,["dvemāsapaṭicchannaṃ",7]
,["Naadhipatipaccayā",8]
,["punappunaṃ",4]
,["puna-p-punaṃ",4]
,["Evaṃ me sutaṃ",5]
,["Evaṃme sutaṃ",5]
,["‘‘ācikkhāmī’’ti vā ‘‘ārocemī’’ti vā",12]
]
data.forEach(line=>{
	const count=line[1];
	const syllabified=syllabify(line[0]);
	let c=0;
	syllabified.map(s=>isSyllable(s)?c++:0)
	console.log(c==count?"pass":"fail");
})

