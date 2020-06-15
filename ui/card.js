'use strict';
/*
	nestable text

*/
const {getdbbookname,parseCAP,open,readlines,isPaliword}=require("pengine");
const {parseId,vpl2paranum,getparallel,matlabel}=require("./fetch");
const {unpackmataddr}=require("./mataddr");
const {decorateText,nissayaText}=require("./decorate");
const {parsedef}=require("./lexicon");
const {getancestor}=require("./tocpopup");
const {getCAPSelection}=require("./selection");
const dbname=["mul","att","tik"];

Vue.component('notebutton',{
	props:['note','id','depth','command','cardcommand'],
	methods:{
		toggle(){
			this.show=!this.show;
		},
		openlink(){
			
		}
	},
	data(){
		return {show:false,showtimer:0} 
	},
	render(h) {
		if (this.show) {
			const children=[];
			let prev=0;
			const notetext=this.note;
			const hyperlink_regex_g=/#(\w+)_(\w+);/g;
			notetext.replace(hyperlink_regex_g,(m,m1,m2,idx)=>{
				const t=notetext.substring(prev,idx)
				if (t) children.push( h('span',{},t));
				const addr=m1+"_"+m2;
				const label=matlabel(addr);
				children.push( h('cardbutton',
					{props:{cap:this.cap,addr,depth:this.depth,
						cardcommand:this.cardcommand,
						command:this.command,label}}));
				prev=idx+m.length;
			});
			let t=notetext.substr(prev)
			if (t) children.push( h('span',{},t));
			children.unshift(h('button',{on:{click:this.toggle}},'x'));

			return h('span',{class:'inlinenote'},children);

		} else{
			return h('span',{class:'notebutton',
				on:{click:this.toggle}},"※");
		}
	}
})

Vue.component('cardbutton',{
	props:['cap','addr','depth','label','command','cardcommand'],
	methods:{
		execcommand(cmd,arg){
			if (cmd=="close") {
				this.show=false;
				return;
			}
			this.command&&this.command(cmd,arg);
		},
		showme(){
			this.show=true;
		}
	},
	data(){
		return {show:false} 
	},
	render(h){
		if (!this.show){
			return h("button",{class:"btnnav",on:{click:this.showme}},this.label);
		} else {
			return h("card",{props:{depth:this.depth+1,
				command:this.execcommand,from:this.cap,
				cardcommand:this.cardcommand,addr :this.addr}});
		}
	}
})

Vue.component('paralleltextbutton',{
	props:['cap','setname','depth','label','command','cardcommand'],
	methods:{
		execcommand(cmd,arg){
			if (cmd=="close") {
				this.show=false;
				return;
			}
			this.command&&this.command(cmd,arg);
		},
		showme(){
			this.show=true;
		}
	},
	render(h){
		if (!this.show){
			return h("button",{class:"btnnav",on:{click:this.showme}},
				this.label?this.label:this.setname.substr(3));
		} else {
			const addr=getparallel(this.cap,this.setname);
			return h("card",{props:{depth:this.depth+1,
				command:this.execcommand,from:this.cap,
				cardcommand:this.cardcommand,addr }});
		}
	},
	data(){
		return {show:false} 
	},
})

const CardNav=Vue.extend({
	props:['cap','command'],
	methods:{
		inputparanum(event){
			//TODO mn1 short cut
			if (event.key=="Enter"){
				//allow x100 for line number
				const v=event.srcElement.value.trim(); 
				if (v.indexOf("_")>-1 || v.indexOf(":")>-1) {
					const cap=parseCAP(v,this.cap.db);
					this.command('setcap',cap);
					return;
				}
				const para=parseInt(v);
				let n=this.cap.bk+"_";
				n+=(para.toString()==v)?(para):v;
				const cap=parseCAP(n,this.cap.db);
				this.command('setcap',cap);
			}
		},
		prevpara(){
			this.command('setcap',this.cap.prevp());
		},
		nextpara(){
			this.command('setcap',this.cap.nextp());
		},
		selectsid(sid){
			const cap=parseCAP(sid,this.cap.db);
			this.command('setcap',cap);
		},

		onselecttocitem(linkto){
			if (linkto) this.selectsid(linkto)
			this.selectingtocitem=false;
		},
		selecttocitem(event){
			this.depth=parseInt(event.srcElement.attributes.depth.value);
			this.selectingtocitem=true;
		}
	},
	data(){
		return {depth:0,selectingtocitem:false,thispara:this.cap._}
	},
	updated(){
		this.$refs.paranum.value=this.cap._;
	},
	render(h){
		const ancestor=getancestor(this.cap);
		let selecting=0,cap;
		const arr=ancestor.filter(item=>item.d>=this.depth);
		if (this.depth&&arr.length){
			selecting=arr[0].l;
			cap=parseCAP(selecting,this.cap.db );
		}
		const ancestorspan=ancestor.map((item,idx)=>{
			let t=item.t;
			const at=t.indexOf("|");
			if (at>-1) t=t.substr(at+1);
			return h("span",{class:"tocitem",
				on:{click:this.selecttocitem},
				attrs:{depth:item.d}},"/"+t);
		})
		return h("span",{class:"cardnav"},[
			h("button",{class:"btnnav",on:{click:this.prevpara}},"‹"),
			h("input",{class:"address",ref:"paranum",
				on:{keyup:this.inputparanum},
				attrs:{size:3,value:this.thispara,title:this.cap.bkx}}),
			h("button",{class:"btnnav",on:{click:this.nextpara}},"›"),
			h("span",{},ancestorspan),
			this.selectingtocitem?h("tocitempopup",
				{props:{cap,depth:this.depth,
					onselecttocitem:this.onselecttocitem}}):null
		]
		);
	}
})

Vue.component('toptextmenu',{
	props:['depth','cap','command','cardcommand'],
	methods:{
		close(){
			this.command("closecard");
		},
		movetop(){
			this.command("movetop");
		}
	},
	render(h){

		const sets=["cs0mul","cs0att","cs0tik"].filter(s=>s!==this.cap.db.name);
		const children=sets.map(setname=>h("paralleltextbutton",
			{props:{cap:this.cap,setname,
				command:this.command,cardcommand:this.cardcommand,
				depth:this.depth+1}}))
		children.push(h("autotran",{props:{command:this.command}}));
		children.push(h("span",{on:{click:this.movetop},class:"btnbringtop",
			props:{command:this.command}}));

		children.unshift(h("cardnav",{props:{command:this.command,cap:this.cap}}));
		
		children.unshift(h("span",{on:{click:this.close},class:"btnclose"}));
		return h("div",{class:"toptextmenu"},children);
	},
	components:{
		'cardnav':CardNav
	}
})
Vue.component('autotran',{
	props:['command'],
	methods:{
		toggletranslate(){
			this.command("toggletranslate")
		}
	},
	render(h){
		return h("span",{class:"btntrans",on:{click:this.toggletranslate}})
	}
})
Vue.component('textmenu',{
	props:['depth','command','cap','cardcommand'],
	methods:{
		close(){
			this.command("close");
		},
		bringtop(){
			this.command("bringtop",this.cap);
			this.command("close");
		}
	},
	render(h){
		const props={cap:this.cap,depth:this.depth,
			cardcommand:this.cardcommand,command:this.command};
		if (this.depth==0) {
			return h("toptextmenu",{props});
		}
		return h("div",{},
			 [h("span",{on:{click:this.close},class:"btnclose"}),
			 h("cardnav",{props}),
			 h("autotran",{props}),
			 h("span",{on:{click:this.bringtop},class:"btnbringtop",props})]
		);
	},
	components:{
		'cardnav':CardNav
	}
});
Vue.component('backlinkmenu',{
	props:['cap','links','depth','command','cardcommand'],
	methods:{
		decodelink(link){
			const tdb=link[0];
			const vpl=unpackmataddr(link[1]);
			const fn=getdbbookname(tdb,vpl[0]);
			let addr=fn+"_x"+(vpl[1]-1)
			if (vpl[2]) addr+="y"+vpl[2];
			return parseCAP(addr).stringify();
		}
	},
	render(h){
		const children=this.links?this.links.map( link=>{
			const setname=link[0];
			const cap=parseCAP(link[1], setname);
			const depth=this.depth+1;
			const addr=cap.stringify();
			const label=addr.replace(/y.+/,'');
			return h("cardbutton",
				{props:{command:this.command,cardcommand:this.cardcommand,
					addr,cap:this.cap,label,depth}})
		}):[];
		return h('div',{},children)
	}

})
const findselx=()=>{
	let node=document.getSelection().baseNode;
	while (node){
		if (node.attributes && node.attributes['x0']){
			return parseInt(node.attributes['x0'].value);
		}
		node=node.parentNode;
		if (node==document) break;
	}
	return -1;
};
Vue.component('card', { 
	props:['cardid','addr','depth','from','command','cardcommand'],
	data(){
		return {rawtext:null,prevaddr:'',nti:'',
		cap:null,backlinks:[],autotranslate:false}
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
					this.cap=cap;
					if (typeof this.cardid!=="undefined") this.cardcommand('fetched',this.cardid,cap);
				}
			}
		},
		fetch(cap,updating){
			let obj={},dbname;
			let start=cap.x0-cap.x,count=1;
			this.rawtext=null;
			if (updating){
				start=cap.x0;
			}
			count=cap.nextp(cap.x?2:1).x0 - start;
			readlines(this.cap.db,start,count,res=>{
				this.rawtext=res;
				if(typeof this.cardid!=="undefined") {
					this.prevaddr=this.cap.stringify();//so that it will not get refresh
					this.cardcommand("fetched",this.cardid,this.cap,res);
				}
				this.backlinks=cap.db.getbacklinks(cap.stringify());
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

		const depth=this.depth||0;
		const notes={};
		let notestext='';
		this.rawtext.map((item,idx)=>{
			const at2=item[1].indexOf("|||");
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
			for (var i=0;i<this.rawtext.length;i++){
				const x0=this.rawtext[i][0];
				let t=this.rawtext[i][1];
				const at2=t.indexOf("|||");
				if (at2>0) t=t.substr(0,at2);
				const props={depth:depth+1,cardcommand:this.cardcommand,command:this.command};
				const selectionclick=this.selectionclick;
				const decorated=decorateText({cap:this.cap,nti:this.nti,
					i,x:x0,t,props,notes,h,onclick:this.onSnippetClick
				});
				//const text=this.rawtext[j][1];
				//const textwithotebtn=renderInlineNote(h,text,notes,i,depth+1,props);

				children.push(h('span',{attrs:{x0},on:{mouseup:this.checkselection}},decorated));
				children.push(h('br'));
			}
		}
		children.unshift(h('textmenu',
			{props:{depth,cap:this.cap,command:this.execcommand,
			cardcommand:this.cardcommand}}));
		children.push(h('backlinkmenu',
			{class:"backlinkmenu",props:{
				command:this.execcommand,cardcommand:this.cardcommand,
				cap:this.cap,links:this.backlinks,depth}}));
		let cls='card0';
		if (this.depth) cls="card";
		if (this.autotranslate) cls+=' unknown';
		return h("div",{attrs:{cardid:this.cardid},class:cls},children);
	}
})