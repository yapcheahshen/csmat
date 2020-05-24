require("dui");
require("./maintext");
//require("./bigpopup");
//require("./xref");
require("./logger");
//const ptscite=require("./ptscite");
const helpmessage=[["","巴利聖典逐詞定址系統"]
                  ,["","版本：2020.5.11"]
                  ,["","https://github.com/ksanaforge/csmat/"]]

const dbname=["mul","att","tik"];
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
//const {conjugate,conjugateWord,analyzeword,G_outwords,G_shortdefpost,outputAnalysis}=require("./fromdpr")
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
		keywordchange(){
			//aniccucchādanaparimaddanabhedana  , 8 seconds
			//const t=new Date();
			//const g=outputAnalysis(this.keyword);
			//this.grammarout=g[0][0]+ ",time:"+(new Date()-t);
			//this.grammarout=conjugateWord(this.keyword);
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
			Dengine.readpage(dbname[0],obj,(res,db)=>{
				const elapse=(new Date()).getMilliseconds()-t;
				if (!this.gettoc) this.gettoc=db.gettoc;
				this.rawtext=res;
				//this.rawpagecount=pagecount||1;
				
				setTimeout((function(){
					const sid=res[0][0];
					let at=sid.lastIndexOf(":");
					this.bookname=sid.substr(0,at);
					const page=parseInt(sid.substr(at+1));
//jakata 17~22 有問題
					const vpl=this.bookname+":"+(page+3)+".1";
					this.paranum=vpl2paranum(db,sid);

					this.vpl=vpl;
					this.logmessages.unshift(sid+"fetch "+this.vpl+" elapse"+elapse)
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
		Dengine.openSearchable(dbname[0],function(db){
			this.log(dbname[0]+" opened, built on "+db.getDate());
			Dengine.openSearchable(dbname[1],db2=>{
				this.log(dbname[1]+" opened, built on "+db2.getDate());
				Dengine.openSearchable(dbname[2],db3=>{
					this.log(dbname[2]+" opened, built on "+db3.getDate());
				});
			})
			const {b,p}=URLParams();
			this.bookname=b?b:"1";
			this.paranum=p?p:"1";
			this.db=db;
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
			keyword:'',
			grammarout:'grammar',
			logmessages:[],
			vpl:'',
			timer:0
		}
	}
});