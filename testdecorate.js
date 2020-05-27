const testdata=[
[
	"abcdefghijlmnopqrstuvwxyz",
	[
	[3,3,"red"], [5,3,"underline"]
	]
	,
	[
	[3,"red"], [5,"red underline" ], [6,"underline"], [8,""],
	]
]
]
const {snip}=require("./decorate");
let failed=0,passed=0;
testdata.forEach( item=>{
	const str=item[0], decoration=item[1], expected=item[2];

	const snippet=snip(str,decoration);
	if (JSON.stringify(snippet)!=JSON.stringify(expected)){
		console.log('expected',expected);
		console.log('got',snippet)
		failed++;
	} else {
		passed++;
	}
})
console.log('passed',passed,'failed',failed)