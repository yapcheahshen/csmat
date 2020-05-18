//require("./breadcrumbtoc");
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
const {parseId}=require("./fetch");
new Vue({
	el:"#app",
	methods:{
		nextpara(){
			const pc=this.rawpagecount;
			this.rawpagecount=1;
			this.fetch(this.bookpara,pc,1);
		},
		prevpara(){
			this.rawpagecount=1;
			this.fetch(this.bookpara,-1);
		},
		morepage(){
			this.fetch(this.bookpara,0,this.rawpagecount+1);
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
		bookparachange(){
			clearTimeout(this.timer);
			this.timer=setTimeout(()=>{
				this.fetch(this.bookpara)
			},1000);
		},
		fetch(rawid,plusminus){
			const t=(new Date()).getMilliseconds();
			Dengine.readpage(dbname,{parseId,rawid,plusminus},(res,db)=>{
				const elapse=(new Date()).getMilliseconds()-t;
				setHash({q:rawid});
				//const pagenum=res[0][0];
				//const pagenums=res.map(item=>item[0]);
				if (!this.gettoc) this.gettoc=db.gettoc;
				this.rawtext=res;
				this.rawpagecount=pagecount||1;
				/*
				setTimeout((function(){
					this.vpl=pagenum;
					const at=pagenum.lastIndexOf(".");
					this.pagenum=pagenum.substr(0,at);
					this.logmessages.unshift("fetch "+prefix+" elapse"+elapse)
				}).bind(this),200);
				*/
			})
		},
		selectsid(sid){
			this.fetch(sid);
		},
		log(msg){
			this.logmessages.unshift((new Date()).toISOString()+":"+msg);
		}
	},

	mounted(){
		Dengine.openSearchable(dbname,function(db){
			const {q,i}=URLParams();
			this.bookpara=q?q:"1,10";
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
			bookpara:'',
			ptspagenum:'',
			logmessages:[],
			vpl:'',
			timer:0
		}
	}
});