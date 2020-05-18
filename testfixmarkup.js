const workers=require("./fixmarkup");

const tests={backmovepb:[
	[`pali <pb ed="T" n="1.0001" /><pb ed="M" n="2.0002" /><pb ed="P" n="3.0003" /><pb ed="V" n="4.0004" /> text`,
	`<pb t="t1.1;m2.2;p3.3;v4.4"/>pali text`],

	[`pali<pb ed="T" n="1.0001" /><pb ed="M" n="2.0002" /><pb ed="P" n="3.0003" /> text`,
	`<pb t="t1.1;m2.2;p3.3"/>pali text`],

	[`pali<pb ed="T" n="1.0001" /><pb ed="M" n="2.0002" /> text`,
	`<pb t="t1.1;m2.2"/>pali text`],

	[`pali<pb ed="T" n="1.0001" /> text`,
	`<pb t="t1.1"/>pali text`],

	[`loke…pe… <pb ed="M" n="0.0107" /> ghānaṃ`,
	`<pb t="m0.107"/>loke…pe… ghānaṃ`],

	[`‘‘atītārammaṇa’’ntipi, <pb ed="T" n="0.0151" /> ‘‘anāgatārammaṇa’’ntipi,`,
	`<pb t="t0.151"/>‘‘atītārammaṇa’’ntipi, ‘‘anāgatārammaṇa’’ntipi,`],
	[`‘‘nāmaṃ’’ <pb ed="M" n="0.0143" />. Tattha,`,
	`<pb t="m0.143"/>‘‘nāmaṃ’’. Tattha,`
	],


	[`text {Diṭṭhivisuddhi}<pb ed="P" n="0.0234" />text`,
	`text <pb t="p0.234"/>{Diṭṭhivisuddhi}text`],
//multiple tag following bold text
	[`text{Diṭṭhivisuddhi}<pb ed="P" n="0.0234" /><pb ed="T" n="0.002" /> text`,
	`text<pb t="p0.234;t0.2"/>{Diṭṭhivisuddhi} text`],

//unmoved pb
	[`<p rend="bodytext"><pb ed="V" n="0.0328" /></p>`,
	`<p rend="bodytext"><pb T="v0.328"/></p>`],

	[`atthi nevavipākanavipākadhammadhammo. <pb ed="T" n="0.0026" /> q`,
	`atthi nevavipākanavipākadhammadhammo. <pb T="t0.26"/> q`],
]
,
groupgatha:[
	[`<p rend="gatha1">G1</p>
<p rend="gathalast">GL</p>`,
`<p rend="gatha">G1;<gbrk/>GL</p>`
	],

	[`<p rend="gatha1">G1</p>
<p rend="gatha2">G2</p>
<p rend="gatha3">G3</p>
<p rend="gathalast">GL</p>`,
`<p rend="gatha">G1;<gbrk/>G2;<gbrk/>G3;<gbrk/>GL</p>`
	],

	[`<p rend="gatha1">G1-1</p>
<p rend="gatha2">G1-2</p>
<p rend="gathalast">G1-3</p>

<p rend="gatha1">G2-1</p>
<p rend="gathalast">G2-2</p>
<p rend="gatha1">G3-1</p>`,
`<p rend="gatha">G1-1;<gbrk/>G1-2;<gbrk/>G1-3</p>

<p rend="gatha">G2-1;<gbrk/>G2-2</p>
<p rend="gatha">G3-1</p>`
	]
],
alphanum:[
	[`(Kha)`,`<n c="Kha"/>`]
	,[`(1)`,`<n c="1"/>`]
	,[`(1-3)`,`<n c="1-3"/>`]

	,[`[Kha]`,`<n b="Kha"/>`]
	,[`[11]`,`<n b="11"/>`]
	,[`[1-3]`,`<n b="1-3"/>`]
],
nullify:[
	['(xxx)','<note C="xxx"/>'],
	['(xxx yyy)','<note c="xxx yyy"/>'],
	['[xxx]','<note B="xxx"/>'],
	['[xxx yyy]','<note b="xxx yyy"/>'],
	['(eka<note>yena (?)</note> xx yy)','(eka<note a="yena (?)"/> xx yy)']
],

//"{xxx<pb/>yyy}" => "{xxx}<pb/>{yyy}"

}
let passed=0,failed=0;

for (w in tests ) {
	tests[w].forEach((test,idx)=>{
		const out=workers[w](test[0],'(testname)');
		if (out!==test[1]) {
			console.log('error test',idx);
			console.log('expected:\n',test[1])
			console.log('got     :\n',out);
			failed++;
		} else passed++;
	})

}

//let s=`<p><hi rend="bold"><pb t="v0.113"/>Ajānamevaṃ, āvuso, avacaṃ – jānāmi, apassaṃ passāmī</hi>`
//console.log(s.replace(/<hi rend="bold"><(.+?)>([^<]+?)<\/hi>/g,"<$1>{$2}"))
console.log(passed,"passed",failed,"failed")