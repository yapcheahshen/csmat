/*
	nestable text

*/
const {SEGSEP,getdbbookname}=require("dengine");
const {parseId,vpl2paranum,getparallel,matlabel}=require("./fetch");
const {filename2set,hyperlink_regex_g,hyperlink_regex}=require("./linkparser");
const {unpackmataddr}=require("./mataddr");
const {decorateText}=require("./decorate");
const {parsedef}=require("./lexicon");
const {getancestor}=require("./tocpopup");
const dbname=["mul","att","tik"];

Vue.component('notebutton',{
	props:['note','id','depth'],
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
			notetext.replace(hyperlink_regex_g,(m,m1,m2,idx)=>{
				const t=notetext.substring(prev,idx)
				if (t) children.push( h('span',{},t));
				const rawid=m1+"p"+m2;
				const label=matlabel(rawid);
				const setname=filename2set(rawid);
				children.push( h('paralleltextbutton',
					{props:{rawid,depth:this.depth,setname,label}}));
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

const renderInlineNote=(h,text,notes,nline,depth)=>{
	let p=0;
	const children=[];

	text.replace(/\^(\d+)/g,(m,m1,p1)=>{
		const t=text.substring(p,p1);
		if (t) children.push( h('span',t));

		const note=notes[nline+"_"+m1];
		if (note) {
			const m=note.trim().match(hyperlink_regex);
			if (m){
				const rawid=m[1]+"p"+m[2];
				const label=matlabel(rawid);
				const setname=filename2set(rawid);
				children.push( h('paralleltextbutton',
					{props:{rawid,depth,setname,label}}));
			} else {
				children.push(h('notebutton',{props:{id:m1,note,depth}}));
			}
		} else {
			children.push(h('xrefbutton',{props:{xref:m1,openxref:this.openxref}})) 
		}
		p=p1+m.length;
	})
	if (children.length==0) {
		return text;
	}
	children.push( h('span',{},text.substr(p)))
	return children;
}

Vue.component('paralleltextbutton',{
	props:['db','setname','depth','bkdoc','label'],
	methods:{
		execcommand(cmd){
			if (cmd=="close") this.show=false;
			return true;
		},
		showme(){
			this.show=true;
		}
	},
	render(h){
		if (!this.show){
			return h("button",{class:"btnnav",on:{click:this.showme}},
				this.label?this.label:this.setname);
		} else {
			let addr=this.bkdoc;
			addr=getparallel(this.db,this.setname,this.bkdoc);
			return h("card",{props:{depth:this.depth+1,
				command:this.execcommand,addr }});
		}
	},
	data(){
		return {show:false} 
	},
})
Vue.component('xrefbutton',{
	props:['xref','openxref'],
	methods:{
		open(){
			const a=this.xref.split(SEGSEP+SEGSEP);
			this.openxref(a[0],a[1]);
		}
	},
	render(h) {
		const a=this.xref.split(SEGSEP+SEGSEP);
		return h('span',{class:'xrefbutton',on:{click:this.open}},a[1]);

	}
})
const CardNav=Vue.extend({
	props:['db','bkdoc','command'],
	methods:{
		inputaddress(event){
			if (event.key=="Enter"){
				this.command('setbkdoc',event.srcElement.value);
			}
		},
		inputparanum(event){
			if (event.key=="Enter"){
				const arr=this.prefix.split(":");
				const para=event.srcElement.value;
				const newid=arr[0]+"p"+para;
				this.command('setbkdoc',newid);
			}
		},
		setbkdoc(newpara){
			const arr=this.prefix.split(":");
			newid=arr[0]+"p"+newpara;
			this.command('setbkdoc',newid);
		},
		prevpara(){
			prev=this.thispara-1;
			if (prev<1)prev=1;
			this.setbkdoc(prev);
		},
		nextpara(){
			this.setbkdoc(this.thispara+1);
		},
		selectsid(sid){
			if (!sid)return;
			const arr=sid.split(":");
			
			let bk=arr[0],docseq=arr[1];
			if (parseInt(bk).toString()==bk) {
				bk=this.db.bookseq2name(bk);
			}

			this.command('setbkdoc',bk+":"+docseq);
		},

		onselecttocitem(linkto){
			this.selectsid(linkto)
			this.selectingtocitem=false;
		},
		selecttocitem(event){
			this.depth=parseInt(event.srcElement.attributes.depth.value);
			this.selectingtocitem=true;
		},
		getaddress(){
			return this.bkdoc;
		}
	},
	data(){
		return {depth:0,selectingtocitem:false,thispara:0,prefix:''}
	},
	updated(){
		this.$refs.addr.value=this.prefix;
		const para=vpl2paranum(this.db,this.prefix);
		this.$refs.paranum.value=para;
	},
	render(h){
		const tid=parseId(this.db,{rawid:this.bkdoc||""});
		this.prefix=tid&&tid.prefix;
		const ancestor=getancestor(this.db,this.prefix);
		this.thispara=vpl2paranum(this.db,this.prefix);

		const ancestorspan=ancestor.map((item,idx)=>{
			let t=item.t;
			const at=t.indexOf("|");
			if (at>-1) t=t.substr(at+1);
			return h("span",{class:"tocitem",
				on:{click:this.selecttocitem},
				attrs:{depth:item.d}},"/"+t);
		})
		return h("span",{},[
			h("input",{class:"address",
				on:{keyup:this.inputaddress},ref:"addr",
				attrs:{size:10,value:this.prefix}}),
			h("button",{class:"btnnav",on:{click:this.prevpara}},"〈"),
			h("input",{class:"address",ref:"paranum",
				on:{keyup:this.inputparanum},
				attrs:{size:3,value:this.thispara}}),
			h("button",{class:"btnnav",on:{click:this.nextpara}},"〉"),
			h("span",{},ancestorspan),
			this.selectingtocitem?h("tocitempopup",
				{props:{db:this.db,tid:tid&&tid.prefix,depth:this.depth,
					onselecttocitem:this.onselecttocitem,}}):null
		]
		);
	}
})

Vue.component('topleveltextmenu',{
	props:['depth','bkdoc','command','db'],
	render(h){
		const dbname=filename2set(this.bkdoc);
		const sets=["mul","att","tik"].filter(s=>s!==dbname);
		const children=sets.map(setname=>h("paralleltextbutton",
			{props:{db:this.db,setname,bkdoc:this.bkdoc,
				depth:this.depth+1}}))
		children.push(h("autotran",{props:{command:this.command}}));
		children.push(h("cardnav",{props:{command:this.command,bkdoc:this.bkdoc,db:this.db}}));
		return h("div",{class:"topleveltextmenu"},children);
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
		return h("span",{class:"translatebtn",on:{click:this.toggletranslate}},
			"䛊")
	}
})
Vue.component('textmenu',{
	props:['depth','command','bkdoc','db'],
	methods:{
		onclose(){
			this.command("close");
		}
	},
	render(h){
		const attr={on:{click:this.onclose},
		props:{bkdoc:this.bkdoc,db:this.db,depth:this.depth,command:this.command}};
		if (this.depth==0) {
			return h("topleveltextmenu",attr);
		}
		return h("div",{},
			 [h("button",attr,"close"),
			 h("cardnav",{props:{db:this.db,bkdoc:this.bkdoc,command:this.command}}),
			 h("autotran",{props:{command:this.command}})]
		);
	},
	components:{
		'cardnav':CardNav
	}
});
Vue.component('backlinkmenu',{
	props:['links','depth','db'],
	//props:['setname','closeme','depth','rawid','label'],
	methods:{
		decodelink(link,setname){
			const tdb=link[0];
			const vpl=unpackmataddr(link[1]);
			const fn=getdbbookname(tdb,vpl[0]);
			const bkdoc=fn+":"+vpl[1]
			return bkdoc;
		}
	},
	render(h){
		const children=this.links?this.links.map( link=>{
			const setname=link[0];
			const bkdoc=this.decodelink(link,setname);
			const depth=this.depth+1;
			const label=bkdoc;//matlabel(bkdoc);
			return h("paralleltextbutton",
				{props:{db:this.db,command:this.command,bkdoc,label,setname,depth}})
		}):[];
		return h('div',{},children)
	}

})

Vue.component('card', { 
	props:['cardid','addr','depth','fetched','command'],
	data(){
		return {rawtext:null,prevaddr:'',bkdoc:'',prevbkdoc:'',
		backlinks:[],autotranslate:false}
	},
	methods:{
		onnote(note){
			alert(note)
		},
		setbkdoc(bkdoc){

			this.bkdoc=bkdoc;
		},
		fetch(bkdoc){
			let obj={},dbname;
			dbname=filename2set(this.addr);
			obj={parseId,rawid:bkdoc||this.addr,extrapara:1};
			
			Dengine.readpage(dbname,obj,(res,db)=>{
				this.bkdoc=obj.prefix;
				this.prevbkdoc=obj.prefix;
				this.db=db;
				if (!this.gettoc) this.gettoc=db.gettoc;
				this.rawtext=res;
				if (this.fetched) this.fetched(res,obj.prefix,this.cardid);

				this.backlinks=db.getbacklinks(this.addr);
			});	
			this.prevaddr=this.addr;
		},
		execcommand(cmd,arg){
			let r=null;
			if (this.command) r=this.command(cmd);
			//if (r)return;

			if (cmd=='toggletranslate') {
				this.autotranslate=!this.autotranslate;
			} else if (cmd=='setbkdoc'){
				this.setbkdoc(arg);
			}
		}
	},


	render(h){
		if (this.prevaddr!==this.addr ) {
			this.fetch();
		} else if (this.prevbkdoc!==this.bkdoc){
			this.fetch(this.bkdoc);
		}

		if (!this.rawtext) {
			return h("span",{},"Loading "+this.addr)
		}

		const depth=this.depth||0;
		const notes={};


		this.rawtext.map((item,idx)=>{
			if (item[2]) { //has note
				const ns=item[2].split(/(\d+)\^/).filter(item=>item);
				for (var i=0;i<ns.length>>1;i++) {
					notes[idx+"_"+ns[i*2]]=ns[i*2+1];
				}
			} 
		})

		const children=[];
		if (this.autotranslate){
			for (var j=0;j<this.rawtext.length;j++){
				const text=this.rawtext[j][1];
				
				const snippet=decorateText(text);	
				
				let n=0,t='',prevclass='';
				//need to loop until text.length, or last word is not rendered
				for (var i=0;i<=text.length;i++){ 
					if (n<snippet.length&&snippet[n][0]==i) {
						if (prevclass[0]=="@") {
							const rb=h('rb',{},t);

							const {cls,def,extra}=parsedef(prevclass.substr(1));
							let rtspan=def;

							if (extra) {
								rtspan=[def||"…",
								h('span',{class:"tip"},extra
									//[h('span',{},extra)]
								)
								]
							}
							const rt=h('rt',{class:cls},rtspan);
							children.push(h('ruby',{class:"known"},[rb,rt]));

						} else {
							const textwithotebtn=renderInlineNote(h,t,notes,j,depth+1);
							children.push(h('span',{class:prevclass},textwithotebtn));
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
		} else {
			for (var j=0;j<this.rawtext.length;j++){
				const text=this.rawtext[j][1];
				const textwithotebtn=renderInlineNote(h,text,notes,j,depth+1);
				children.push(h('span',{},textwithotebtn));
				children.push(h('br'));
			}
		}

		children.unshift(h('textmenu',
			{props:{db:this.db,depth,
				bkdoc:this.bkdoc,command:this.execcommand}}));
		children.push(h('backlinkmenu',
			{class:"backlinkmenu",props:{db:this.db,links:this.backlinks,depth}}));

		let cls='card0';
		if (this.depth) cls="card";
		if (this.autotranslate) cls+=' unknown';
		return h("div",{class:cls},children);
	}
})