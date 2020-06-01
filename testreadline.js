const {openSync,readlines}=require("dengine");
const seq=parseInt(process.argv[2])||0;
const count=parseInt(process.argv[3])||1;
const mul=openSync("mul");
const out=readlines(mul,seq,count);
console.log(out);