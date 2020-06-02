require("./popup");
require("./cards");
//require("./bigpopup");
//require("./xref");
require("./bookmark");
require("./logger");
//const ptscite=require("./ptscite");
const helpmessage=[];//[["","巴利聖典逐詞定址系統"]]
               //   ,["","版本：2020.5.11"]
                //  ,["","https://github.com/ksanaforge/csmat/"]]

const dbname=["mul","att","tik"];
const URLParams=()=>{
	let hash=document.location.hash.substr(1);
	const p=new URLSearchParams(hash);
	const out={};
	p.forEach( (v,k)=>out[k]=v);
	return out;
}
const setHash=(newobj)=>{
	let hash=document.location.hash.substr(1);
	const p=new URLSearchParams(hash);
	for (var key in newobj){
		p.delete(key);
		if (newobj[key]) p.append(key,newobj[key]);
	}
	document.location.hash="#"+p.toString();
}


//const {conjugate,conjugateWord,analyzeword,G_outwords,G_shortdefpost,outputAnalysis}=require("./fromdpr")
const {vpl2paranum,id_regex}=require("./fetch");
new Vue({
	el:"#app",
	methods:{
		/*
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
			},800);
		},
		keywordchange(){
		},
		paranumchange(){
			clearTimeout(this.timer);
			this.timer=setTimeout(()=>{
				this.fetchPara(this.bookname,this.paranum)
			},800);
		},
		fetchPara(bookname,paranum,plusminus){
			const rawid=(paranum[0]==":")?bookname+paranum
			:bookname+"p"+paranum;
			setHash({a:rawid});
			this.rawid=rawid;
			//const fetchobj={parseId,rawid,plusminus};
			//this.fetch(fetchobj);
		},

		fetched(res){
			const t=(new Date()).getMilliseconds();
			Dengine.open(dbname[0],db=>{
				const elapse=(new Date()).getMilliseconds()-t;
				setTimeout((function(){
					const sid=res[0][0];
					let at=sid.lastIndexOf(":");
					this.bookname=sid.substr(0,at);
					const docseq=parseInt(sid.substr(at+1));

//jakata 17~22 有問題
					let book='';
					if (parseInt(book).toString()==book) {
						book=parseInt(this.bookname);
					} else {
						book=db.bookname2seq(this.bookname);
					}
					const vpl=book+":"+(docseq+3)+".1";

					this.paranum=vpl2paranum(db,sid);
					this.vpl=vpl; //tree toc still using bookseq:docseq
					this.logmessages.unshift(sid+"fetch "+this.vpl+" elapse"+elapse)
				}).bind(this),200);
			})
		},
		setrawid(rawid){
			this.rawid=rawid;
		},
		selectsid(sid){
			const arr=sid.split(":");
			let bk=arr[0],docseq=arr[1];
			if (parseInt(bk).toString()==bk) {
				bk=this.db.bookseq2name(bk);
			}
			this.rawid=bk+":"+docseq;
		},
		*/
		log(msg){
			this.logmessages.unshift((new Date()).toISOString()+":"+msg);
		},
		openbookmark(){

		},
		setaddrs(addrs){
			setHash({a:addrs.join(";")})
		}

	},
	mounted(){
		let selectiontimer=0;
		document.addEventListener('selectionchange', (event) => {
		  clearTimeout(selectiontimer);
		  selectiontimer=setTimeout(()=>{
		  	const sel=document.getSelection();
		  	if (!sel||!sel.baseNode)return;
		  	const f=sel.baseNode.parentElement;
		  	let tf=sel.toString().toLowerCase().trim();
		  	if (!tf) return;
		  	if (parseInt(tf))return;
		  	this.seltext=tf;
		  },500);
		});

		Dengine.openSearchable(dbname[0],function(db){
			this.log(dbname[0]+" opened, built on "+db.getDate());
			Dengine.openSearchable(dbname[1],db2=>{
				this.log(dbname[1]+" opened, built on "+db2.getDate());
				Dengine.openSearchable(dbname[2],db3=>{
					this.log(dbname[2]+" opened, built on "+db3.getDate());
					this.ready=true;
				});
			})
			let {a}=URLParams();
			a=a?a:"s0101m_p1";
			const cardsaddr=[];
			const addrarr=a.split(";");
			for (let addr of addrarr){
				const m=addr.match(id_regex);
				if (m){
					cardsaddr.push(addr);
				}
			}
			if (cardsaddr.length==0){
				cardsaddr.push("vin01m_p1");
			}
			this.addrs=cardsaddr;

		}.bind(this));

		setInterval(()=>{
			this.logmessages.pop();
		},10000);
	},
	data(){
		return {
			addrs:[],
			ready:false,
			seltext:'',
			rawtext:helpmessage,
			logmessages:[],
		}
	}
});