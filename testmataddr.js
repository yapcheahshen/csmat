const {unpackmataddr,makemataddr,humanlink}=require("./mataddr");

let o=makemataddr(1,2,3);

const u=unpackmataddr(16111272110);
console.log(u)