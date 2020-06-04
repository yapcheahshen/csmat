//find all quote with cap address
const fs=require("fs");
const regex=/‘‘([^’]+?)’’n?ti *\^(\d+)/g

const fn="att-raw";
const arr=fs.readFileSync(fn+".txt","utf8").split(/\r?\n/);
console.log("start extract");
const out=[]
for (let i=0;i<arr.length;i++){
	const t=arr[i];
	const t2=t.split("|||");
	const notes=t2[1]?t2[1].split(/(\d+\^)/):[];
	t2[0].replace(regex,(m,m1,m2)=>{
		const n=parseInt(m2)-1;
		out.push(m +"|||"+t2[1] );
	});

	
}
out.sort();
fs.writeFileSync(fn+"-quote.txt",out.join("\n"),"utf8")