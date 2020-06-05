const linkpatterns=[
	/dī. [āīūḷṁṃñṇṅṭḍa-y\.]+ [āīūḷṁṃñṇṅṭḍa-y\.]+ ?ṭī\.? [\-\d\.]+/gi,
	/cūḷani\. [āīūḷṁṃñṇṅṭḍa-y\.]+ [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ [āīūḷṁṃñṇṅṭḍa-y\.]+ ?ṭī\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ [āīūḷṁṃñṇṅṭḍa-y\.]+ ?aṭṭha\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ [a-y][āai]\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ ?ni\. aṭṭha\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ ?aṭṭha\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ ?ni\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ ?ṭī\.? [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y]+\. [āīūḷṁṃñṇṅṭḍa-y\.]+ [\-\d\.]+/gi,
	/[āīūḷṁṃñṇṅṭḍa-y\.]+ [\-\d\.]+/gi,
]


const hyperlink_regex=/#([sabhvine]+\d+[mat]\d?)_p(\d+);/
const hyperlink_regex_g=/#([sabhvine]+\d+[mat]\d?)_p(\d+);/g

const citehandler=require("./citehandler");

const recognise=(link)=>{
	let res=0,ok=false,lastpat;
	for (var i=0;i<citehandler.length;i++){
		const pat=citehandler[i];
		const m=link.match(pat[0]);
		if (m) {
			res=pat[1]( m[1]);
			return res;
		}
	}
}
const anna={"e0101n":"mul","e0102n":"mul","e0103n":"att","e0104":"att"}
const filename2set=fn=>{
	if (anna[fn.substr(0,6)]) return anna[fn.substr(0,6)];
	const m=fn.match(/\d+([mat])/);
	if (m) {
		return {m:"mul","a":"att","t":"tik"}[m[1]];
	}
}
module.exports={recognise,linkpatterns,filename2set,hyperlink_regex
,hyperlink_regex_g}