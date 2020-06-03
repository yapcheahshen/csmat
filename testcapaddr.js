const {openSync,parse,stringify,readlines}=require("dengine");

["mul","att","tik"].forEach(n=>openSync(n));

let failed=0,passed=0;
const assert=(a,b,testname)=>{
	if (a!==b) {
		testname&&console.log('test:',testname);
		console.log('expecting',a);
		console.log('got',b);
		failed++;		
	} else passed++
}
const test1=()=>{
	let cap;

	cap=parse("mul@vin01m_x0");

	readlines(cap.db,cap.x0);

	assert(0,cap.x0,'x0==0')
	assert("centre| Namo tassa",cap.getline().substr(0,18),"getline")
	assert("vin01m_x0",cap.stringify());
	assert("1:1",cap.bkx,"bkx 1:1");
	
	cap=parse("mul@vin01m_x1");
	assert(1,cap.x0,'x0==1')
	assert("nikaya|Vinayapiṭake",cap.getline(),"getline")
	assert("vin01m_x1",cap.stringify());

	cap=parse("mul@vin01m_p1");
	assert("vin01m_p1",cap.stringify());
	
	assert(4,cap.x0,'x0==4')
	assert("1|Tena samayena buddho",cap.getline().substr(0,22),"getline")

	cap=parse("mul@vin01m_x6");
	assert("vin01m_p2x1",cap.stringify());
	
	assert(6,cap.x0,'x0==6')
	assert("‘‘Nāhaṃ taṃ",cap.getline().substr(0,11),'getline')

	readlines(cap.db,2406);
	cap=parse("mul@vin01m_x2406"); 
	assert("vin01m_p662x2",cap.stringify());
	assert("centre|Pārājikapāḷi niṭṭhitā.",cap.getline(),'last getline');

	cap=parse("mul@vin02m1_x3"); 
	readlines(cap.db,2408);
	assert("chapter|5. Pācittiyakaṇḍaṃ",cap.getline())

	cap=parse("mul@e0102n_x1900"); 
	assert("e0102n_p896x4",cap.stringify());
	readlines(cap.db,cap.x0);
	assert("centre|Visuddhimaggapakaraṇaṃ niṭṭhitaṃ.",cap.getline(),"db last line");
	assert("63:1901",cap.bkx,"bkx 63:1901");

	cap=parse("1:1","mul");
	assert("vin01m_x0",cap.stringify());

	cap=parse("1:0","mul");
	assert("vin01m_x0",cap.stringify());

	cap=parse("63:1901","mul");
	assert("e0102n_p896x4",cap.stringify());

	cap=parse("63:2000","mul"); //not exists in db, a virtual space
	assert("e0102n_p896x103",cap.stringify());//largest p ==896
}

const testnav=()=>{
	let cap=parse("mul@1:76");
	assert("vin01m_p45x3",cap.stringify())
	let next=cap.nextp();
	assert("vin01m_p46",next.stringify())
	next=next.nextp();
	assert("vin01m_p47",next.stringify())

	cap=parse("mul@1:76");
	let prev=cap.prevp(); //roll to begining of paranum
	assert("vin01m_p45",prev.stringify())
	next=cap.nextp();
	assert("vin01m_p46",next.stringify())
}
const test=()=>{
	test1();
	testnav();
}

test();
console.log("passed",passed,"failed",failed)