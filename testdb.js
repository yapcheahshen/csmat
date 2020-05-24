const {openSync}=require("dengine");

const db=openSync("mul");

//let res=db.filesFromId(['1:1'])


let res=db.fetchSync(['1:24']);
 res=db.fetchSync(['1:25']);
console.log(res)
//console.log(db.gettoc())
