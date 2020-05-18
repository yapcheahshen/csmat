const diff=require("diff");
const palidiff=new diff.Diff();
function removeEmpty(array) {
	var ret = [];
	for (var i = 0; i < array.length; i++) {
	  if (array[i]) {
	    ret.push(array[i]);
	  }
	}
	return ret;
	}
palidiff.tokenize=function(value){
	return removeEmpty(value.split(/([^a-zāīūṁṃñṅṇḍṭḷ])/i));
}
module.exports=(a,b)=>palidiff.diff(a,b);