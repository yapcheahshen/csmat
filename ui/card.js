'use strict';
require("./textmenu")
require("./intextbutton")
const {getdbbookname,parseCAP,newCAP,
	open,readlines,isPaliword,NOTESEP}=require("pengine");
const {unpackmataddr}=require("./mataddr");
const {decorateText,nissayaText}=require("./decorate");
const {parsedef}=require("./lexicon");
const {getCAPSelection}=require("./selection");
const {getintextbacklinks,parseBacklink}=require("./backlinks");
const BACKLINKSEP="|";

Vue.component('card', { 
	props:['cardid','addr','depth','from','displayline','command','cardcommand'],
	data(){
		return {rawtext:null,prevaddr:'',nti:'',disline:this.displayline,
		cap:null,backlinks:[],autotranslate:false,backlink:'',activelink:''}
	},
	methods:{
		onnote(note){
			alert(note)
		},
		setcap(cap){
			this.cap=cap;
			this.fetch(cap,true);
		},
		mounted(){
			fetch(this.cap);
		},
		checkselection(event){
			const sel=getCAPSelection();
			if (sel) {
				if (sel.z>1) {
					const cap=parseCAP(sel.x0 ,this.cap.db);
					cap.y=sel.y;
					cap.z=sel.z;
					if (typeof this.cardid!=="undefined") {
						this.cardcommand('fetched',this.cardid,cap);
					}
				}
			}
		},
		fetch(cap,updating){
			let obj={};
			let start=cap.x0-cap.x;
			let count=cap._w;
			this.rawtext=null;
				
			if (this.disline&&this.depth>1) {
				count=Math.abs(this.disline);
				start=cap.x0;
				if (this.disline<0) this.disline=0;
			}
			readlines(this.cap.db,start,count,res=>{
				this.rawtext=res;
				if(typeof this.cardid!=="undefined") {
					this.prevaddr=this.cap.stringify();//so that it will not get refresh
					this.cardcommand("fetched",this.cardid,this.cap,res);
				}
				this.backlinks=cap.db.getbacklinks(cap.stringify())||[];
			});	
			this.prevaddr=this.addr;
		},
		onSnippetClick(event){
			const ele=event.srcElement;
			const cl=ele.classList
			if (cl.contains("nti")){
				this.command&&this.command("setnti",ele.textContent);
			} else if(cl.contains("yzrange")){
				this.cardcommand("dictionary",this.cardid,ele.textContent);
			}
		},
		nissaya(h,children){
			for (var j=0;j<this.rawtext.length;j++){
				const text=this.rawtext[j][1];
				
				const snippet=nissayaText(text);	
				
				let n=0,t='',prevclass='';
				//need to loop until text.length, or last word is not rendered
				for (var i=0;i<=text.length;i++){ 
					if (n<snippet.length&&snippet[n][0]==i) {
						if (prevclass[0]=="@") {
							const rb=h('rb',{},t);

							const {cls,def,extra}=parsedef(prevclass.substr(1));
							let rtspan=def;

							if (extra) {
								rtspan=[def||"…",h('span',{class:"tip"},extra)]
							}
							const rt=h('rt',{class:cls},rtspan);
							children.push(h('ruby',{class:"known"},[rb,rt]));

						} else {
							children.push(h('span',t));
						}
						t='';
						prevclass=snippet[n][1];
						n++;
					}
					if (i<text.length) t+=text[i];
				}
				children.push(h('span',{class:prevclass},t));
				children.push(h('br'));
			}
		},
		clearSelection(){
			const cap=newCAP(this.cap,{y:0,z:0});
			this.cardcommand("fetched",this.cardid,cap);
		},
		execcommand(cmd,arg){
			let r=null;
			if (cmd=='toggletranslate') {
				this.autotranslate=!this.autotranslate;
				return;
			} else if (cmd=='setcap'){
				this.setcap(arg);
				return;
			} else if (cmd=='closecard'){
				this.cardcommand('close',this.cardid);
			} else if (cmd=='bringtop'){
				this.cardcommand("new",this.cardid,arg);
				return;
			} else if (cmd=='movetop'){//all nested card will be close
				this.cardcommand('close',this.cardid);
				this.cardcommand("new",this.cardid,this.cap);
				return;
			} else if (cmd=='setnti'){
				this.nti=arg;
				return;
			} else if (cmd=='setbacklink') {
				this.backlink=arg;
				if (arg){
					const bl=parseBacklink(arg,this.cap);
				}
				return;
			} else if (cmd=='setactivelink') {
				this.activelink=arg;
				if (arg){
					const bl=parseBacklink(arg,this.cap);
				}
				return;
			}
			if (this.command) r=this.command(cmd,arg);//pass to parent
		}
	},
	render(h){
		if (this.prevaddr!==this.addr) {
			this.cap=parseCAP(this.addr);
			this.prevaddr=this.addr;
			this.fetch(this.cap);
			return;
		}
		if (!this.rawtext) {
			return h("span",{},"Loading "+this.cap.stringify());
		}

		if (this.activelink){
			console.log("render active link")
		}

		const depth=this.depth||0;
		const notes={};
		let notestext='';
		this.rawtext.map((item,idx)=>{
			const at2=item[1].indexOf(NOTESEP);
			if (at2>0) {
				notestext=item[1].substr(at2+3);
			} else return;
			const ns=notestext.split(/(\d+)\^/).filter(item=>item);
			for (var i=0;i<ns.length>>1;i++) {
				notes[idx+"_"+ns[i*2]]=ns[i*2+1];
			}
		
		})

		const children=[];
		if (this.autotranslate){
			this.nissaya(h,children);
		} else {
			const backlinks=getintextbacklinks(this.backlinks,this.cap);

			for (var i=0;i<this.rawtext.length;i++){
				const x0=this.rawtext[i][0];
				let t=this.rawtext[i][1];
				const at2=t.indexOf("|||");
				if (at2>0) t=t.substr(0,at2);
				const props={depth:depth+1,cardcommand:this.cardcommand,
					command:this.execcommand};
				const selectionclick=this.selectionclick;
				const decorated=decorateText({cap:this.cap,nti:this.nti,
					backlinks:backlinks[x0],backlink:this.backlink,activelink:this.activelink,
					x:i,x0:x0,t,props,notes,h,onclick:this.onSnippetClick
				});
				children.push(h('span',{attrs:{x0},on:{mouseup:this.checkselection}},decorated));
				children.push(h('br'));
			}
		}
		const links=this.backlinks.filter(itm=>itm[1].indexOf(BACKLINKSEP)==-1);
		children.unshift(h('textmenu',
			{props:{depth,cap:this.cap,command:this.execcommand,
			cardcommand:this.cardcommand}}));
		children.push(h('backlinkmenu',
			{class:"backlinkmenu",props:{
				command:this.execcommand,
				cardcommand:this.cardcommand,links,depth}}));
		let cls='card0';
		if (this.depth) cls="card";
		if (this.autotranslate) cls+=' unknown';
		return h("div",{attrs:{cardid:this.cardid},class:cls},children);
	}
})