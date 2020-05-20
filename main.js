require("dui");
require("./maintext");
//require("./bigpopup");
//require("./xref");
require("./logger");
//const ptscite=require("./ptscite");
const helpmessage=[["","巴利聖典逐詞定址系統"]
                  ,["","版本：2020.5.11"]
                  ,["","https://github.com/ksanaforge/csmat/"]]

const dbname="mul"
const setHash=(newobj)=>{
	let hash=document.location.hash.substr(1);
	const p=new URLSearchParams(hash);
	for (var key in newobj){
		p.delete(key);
		if (newobj[key]) p.append(key,newobj[key]);
	}
	document.location.hash="#"+p.toString();
}
const URLParams=()=>{
	let hash=document.location.hash.substr(1);
	const p=new URLSearchParams(hash);
	const out={};
	p.forEach( (v,k)=>out[k]=v);
	return out;
}
const {parseId,vpl2paranum}=require("./fetch");
new Vue({
	el:"#app",
	methods:{
		nextpara(){
			const pc=this.rawpagecount;
			this.rawpagecount=1;
			this.paranum=parseInt(this.paranum)+1;
			this.fetchPara(this.bookname,this.paranum);
		},
		prevpara(){
			this.rawpagecount=1;
			let prev=parseInt(this.paranum)-1;
			if (prev<0) prev=0;
			this.paranum=prev;
			this.fetchPara(this.bookname,this.paranum);
		},
		
		openxref(db,vpl){
			Dengine.readpage(db,{prefix:vpl,plusminus:-1,pagecount:2},(res,db)=>{
				this.showpopup=true;
				this.xreftext=res;
			});
		},
		closepopup(){
			console.log("closepopup")
			this.showpopup=false;
		},
		clearlog(){
			this.logmessages=[];
		},
		bookchange(){
			clearTimeout(this.timer);
			this.timer=setTimeout(()=>{
				this.fetchPara(this.bookname,this.paranum)
			},500);
		},
		paranumchange(){
			clearTimeout(this.timer);
			this.timer=setTimeout(()=>{
				this.fetchPara(this.bookname,this.paranum)
			},500);
		},
		fetchPara(bookname,paranum,plusminus){
			const rawid=bookname+","+paranum;
			setHash({b:bookname,p:paranum});
			const fetchobj={parseId,rawid,plusminus};
			this.fetch(fetchobj);
		},
		fetch(obj){
			const t=(new Date()).getMilliseconds();
			Dengine.readpage(dbname,obj,(res,db)=>{
				const elapse=(new Date()).getMilliseconds()-t;
				if (!this.gettoc) this.gettoc=db.gettoc;
				this.rawtext=res;
				//this.rawpagecount=pagecount||1;
				
				setTimeout((function(){
					const sid=res[0][0];
					let at=sid.lastIndexOf(":");
					this.bookname=sid.substr(0,at);
					const page=parseInt(sid.substr(at+1));

					const vpl=this.bookname+":"+(page)+".1";
					this.paranum=vpl2paranum(db,vpl);

					this.vpl=sid;
					this.logmessages.unshift("fetch "+this.vpl+" elapse"+elapse)
				}).bind(this),200);
			})
		},
		selectsid(sid){
			this.fetch({prefix:sid});
		},
		log(msg){
			this.logmessages.unshift((new Date()).toISOString()+":"+msg);
		}
	},

	mounted(){
		Dengine.openSearchable(dbname,function(db){
			const {b,p}=URLParams();
			this.bookname=b?b:"1";
			this.paranum=p?p:"1";
			this.db=db;
			this.log(dbname+" opened, built on "+db.getDate());
		}.bind(this));

		setInterval(()=>{
			this.logmessages.pop();
		},10000);

	},
	data(){
		return {
			db:null,
			showpopup:false,
			rawtext:helpmessage,
			rawpagecount:1,
			gettoc:null,
			bookname:'1',
			paranum:'1',
			ptspagenum:'',
			logmessages:[],
			vpl:'',
			timer:0
		}
	}
});