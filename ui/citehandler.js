//mul bookname
'use strict';
const parseBookPara=link=>{
	const m=link.match(/(\d+)\.(\d+)/);
	if (!m)return null;
	const book=parseInt(m[1]),para=parseInt(m[2]);
	return [book,para]	
}
const anbook=[
's0401m','s0402m1','s0402m2','s0402m3','s0403m1',
's0403m2','s0403m3','s0404m1','s0404m2','s0404m3','s0404m4'
];
const dn_a=(n)=>{
	const o=parseBookPara(n);
	if (o&&o[0]>=1&&o[0]<=3) return 's010'+o[0]+'a_p'+o[1];
	return 1;
}
const mn_a=(n)=>{
	const o=parseBookPara(n);
	if (o&&o[0]>=1&&o[0]<=3) return 's020'+o[0]+'a_p'+o[1];
	return 1;
}
const sn_a=(n)=>{
	const o=parseBookPara(n);
	if (o&&o[0]>=1&&o[0]<=5) return 's030'+o[0]+'a_p'+o[1];
	return 1;
}
const an_a=(n)=>{
	const o=parseBookPara(n);
	if (o&&o[0]>=1&&o[0]<=11) {
		bn=anbook[o[0]-1].replace('m','a');
		return bn+'_p'+o[1];		
	}
	return 1;
}
const dn_t=n=>{
	const o=parseBookPara(n);
	if (o&&o[0]>=1&&o[0]<=3) return 's010'+o[0]+'t_p'+o[1];
	return 1;
}
const mn_t=n=>{
	const o=parseBookPara(n);
	if (o&&o[0]>=1&&o[0]<=3) return 's020'+o[0]+'t_p'+o[1];
	return 1;
}
const sn_t=n=>{
	const o=parseBookPara(n);
	if (o&&o[0]>=1&&o[0]<=5) return 's030'+o[0]+'t_p'+o[1];
	return 1;
}
const an_t=n=>{
	const o=parseBookPara(n);
	if (o&&o[0]>=1&&o[0]<=11) {
		bn=anbook[o[0]-1].replace('m','t');
		return bn+'_p'+o[1];		
	}
	return 1;
}

const dn=n=>{
	const o=parseBookPara(n);
	if (o&&o[0]>=1&&o[0]<=3) return 's010'+o[0]+'m_p'+o[1];
	return 1;
}
const mn=n=>{
	const o=parseBookPara(n);
	if (o&&o[0]>=1&&o[0]<=3) return 's020'+o[0]+'m_p'+o[1];
	return 1;
}
const sn=n=>{
	const o=parseBookPara(n);
	if (o&&o[0]>=1&&o[0]<=5) return 's030'+o[0]+'m_p'+o[1];
	return 1;
}

const an=n=>{
	const o=parseBookPara(n);
	if (o&&o[0]>=1&&o[0]<=11) {
		bn=anbook[o[0]-1];
		return bn+'_p'+o[1];		
	}
	return 1;
}
//visuddhimagga
const visuddhi=num=>{
	return 0;
}
const mv=n=>{return 0}
const generic=n=>{return 0}
const citehandler=[
	[/[Dd]ī\. ?ni\. abhi\. ṭī\. ([\d\., \-]+)/, generic],
	[/[Dd]ī\. ?ni. ?aṭṭha\.? ([\d\., \-]+)/, dn_a],
	[/[Dd]ī\. ?ni. ?ṭī\.? ([\d\., \-]+)/, dn_t],
	[/[Dd]ī\. ?ni. ?([\d\., \-]+)/, dn],
	[/ma\. ?ni. ?aṭṭha\.? ([\d\.\-, ]+)/, mn_a],
	[/ma\. ?ni. ?ṭī\.? ([\d\.\-, ]+)/, mn_t],
	[/ma\. ?ni. ?([\d\.\- ,]+)/, mn],
	[/[Ss]aṃ\.? ?ni. ?aṭṭha\.? ([\d\.\-, ]+)/,sn_a],
	[/[Ss]aṃ\.? ?ni. ?ṭī\.? ([\d\.\-, ]+)/,sn_t],
	[/[Ss]aṃ\.? ?ni. ?([\d\.\-, ]+)/,sn],
	[/[Aa]\. ?ni. ?aṭṭha\.? ([\d\.\-, ]+)/,an_a],
	[/[Aa]\. ?ni. ?ṭī\.? ([\d\.\-, ]+)/,an_t],
	[/[Aa]\. ?ni. ?([\d\.\-, ]+)/,an],

	[/abhidha\. (\d+)/,generic],
	[/apa\. ([\d\.\-, ]+)/,generic],
	[/apa\. aṭṭha\. ([\d\.\-, ]+)/,generic],
//	[/avapucchāniddesa /,generic],
	[/cariyā\.? ([\d\.\-, ]+)/,generic],
	[/cariyā\.? aṭṭha\. ([\d\.\-, ]+)/,generic],
	[/[Vv]isuddhi\. mahāṭ[iī]\. ([\d\.\-, ]+)/,generic],
	[/[Vv]isuddhi\. aṭṭha\. ([\d\.\-, ]+)/,generic],
	[/[Vv]isuddhi\. mahā\. ([\d\.\-, ]+)/,generic],
	[/[Vv]isuddhi\. ṭī\. ([\d\.\-, ]+)/,generic],
	[/[Vv]isuddh[iī]\.? ([\d\.\-, ]+)/,visuddhi],

	[/mahāvagg[ao] ([\d\.\-, ]+)/,mv],
	[/[Mm]ahāva\./,mv],

	[/mahāva\. aṭṭha/,mv],
	[/[Cc]ūḷavagga ([\d\.\-, ]+)/,generic],
	[/c[uū]ḷava\. ([\d\.\-, ]+)/,generic],
	[/cūḷava\. aṭṭha/,generic],
	[/cūḷani\./,generic],
	[/parivāra ([\d\.\-, ]+)/,generic],
	[/dhātu\./,generic],
	[/jā\. aṭṭha\./,generic],
	[/[Jj]ā\. ([\d\.\-, ]+)/,generic],
	[/kathā\. /,generic],
	[/[Kk]hu\. pā\./,generic],
	[/khu\. pā\. aṭṭha\./,generic],
	[/[Uu]dā\. (\d+)/,generic],
	[/udā\. aṭṭha\./,generic],
	[/pari\./,generic],
	[/pāṇin[īi]\.? ([\d\.\-, ]+)/,generic],
	[/[Dd]ha\. pa\. ([\d\.\-, ]+)/,generic],
	[/[Dd]ha\. pa\. aṭṭha/,generic],
	[/[Dd]ha\. sa\. ([\d\.\-, ]+)/,generic],
	[/[Dd]ha\. sa\. aṭṭha/,generic],
	[/[Dd]ha\. sa\. mūlaṭī. (\d+)/,generic],
	[/itivu\./,generic],
	[/itivu\. aṭṭha/,generic],
	[/[Mm]ahāni\. (\d+)/,generic],
	[/[Mm]ahāni\. aṭṭha\. (\d+)/,generic],
	[/mātikā/,generic],
	[/mi. pa./,generic],
	[/[Nn]etti\.? /,generic],
	[/netti\. aṭṭha/,generic],
	[/paṭi\. aṭṭha\. ([\d\-, ]+)/,generic],
	[/paṭi\. ([\d\-, ]+)/,generic],
	[/paṭi\. ma\./,generic],
	[/paṭṭh[aā]\.? ([\d\.\-, ]+)/,generic],
	[/paṭṭhāna\.? ([\d\.\-, ]+)/,generic],
	[/paṭṭhā\. aṭṭha\. ([\d\.\-, ]+)/,generic],
	[/peṭako/,generic],
	[/pe. va. /,generic],
	[/pu\. pa/,generic],
	[/[Ss]a\. sa\. ([\d\-, ]+)/,generic],
	[/sa\. mūlaṭī\.? ([\d\-, ]+)/,generic],


	[/sārattha\. ṭī\./,generic],
	[/[Ss]u\. ni\./,generic],
	[/thera\.? /,generic],
	[/therī\.? /,generic],
	[/therīgā\. /,generic],
	[/[Tt]heragā\./,generic],
	[/pārājika/,generic],
	[/pāci\. ([\d\.\-, ]+)/,generic],
	[/pācittiya ([\d\.\-, ]+)/,generic],
	[/pāci\. aṭṭha\. ([\d\.\-, ]+)/,generic],
	[/[Pp]ārā\. ([\d\.\-, ]+)/,generic],
	[/[Pp]ārā\. aṭṭha\./,generic],
	[/u\. vi\. /,generic],
	[/vaṃ\. /,generic],
	[/vi\. ([\d\-, ]+)/,generic],
	[/vi\. aṭṭha\. ([\d\-, ]+)/,generic],
	[/vi\. vi\./,generic],
	[/vi\. vi\. ṭī\. /,generic],
	[/[Vv]i\. va\. /,generic],

	[/[Vv]ibha\. /,generic],
	[/[Vv]ibha\. aṭṭha\. /,generic],
	[/[Vv]i\. saṅga\.? ?aṭṭha\./,generic],
	[/yama\./,generic],
	[/[yY]athā (\d+)/,generic]
]

/* rare case */
module.exports=citehandler;