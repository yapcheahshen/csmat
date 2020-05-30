/*
	nestable text

*/
const {SEGSEP,getdbbookname}=require("dengine");
const {parseId,vpl2paranum,getparallel,matlabel}=require("./fetch");
const {filename2set,hyperlink_regex_g,hyperlink_regex}=require("./linkparser");
const {unpackmataddr}=require("./mataddr");
const {decorateText}=require("./decorate");
const {parsedef}=require("./lexicon");
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
	props:['setname','depth','rawid','label'],
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
			return h("button",{on:{click:this.showme}},
				this.label?this.label:this.setname);
		} else {
			const rawid=getparallel(this.setname,this.rawid);
			return h("card",{props:{depth:this.depth+1,
				command:this.execcommand,rawid }});
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
	props:['db','rawid'],
	render(h){
		const tid=parseId(this.db,{rawid:this.rawid});
		const m=tid.prefix.match(/(.+?):(\d+)/);
		const bookseq=this.db.bookname2seq(m[1]);
		const ancestor=this.db.gettocancestor(bookseq+":"+m[2]).
			map(item=>item[0]).filter(item=>item!="-").join("/");
		return h("span",{},[
			h("span",this.rawid),
			h("button","〈"),
			h("button","〉"),
			h("span",ancestor)]
		);
	}
})
Vue.component('topleveltextmenu',{
	props:['depth','rawid','command','db'],
	render(h){
		const dbname=filename2set(this.rawid);
		const sets=["mul","att","tik"].filter(s=>s!==dbname);		
		const children=sets.map(setname=>h("paralleltextbutton",
			{props:{setname,rawid:this.rawid,
				depth:this.depth+1}}))
		children.push(h("autotran",{props:{command:this.command}}));
		children.push(h("cardnav",{props:{rawid:this.rawid,db:this.db}}));
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
	props:['depth','command','rawid','db'],
	methods:{
		onclose(){
			this.command("close");
		}
	},
	render(h){
		const attr={on:{click:this.onclose},
		props:{rawid:this.rawid,db:this.db,depth:this.depth,command:this.command}};
		if (this.depth==0) {
			return h("topleveltextmenu",attr);
		}
		return h("div",{},
			 [h("button",attr,"close"),
			 h("cardnav",{}),
			 h("autotran",{props:{command:this.command}})]
		);
	},
	components:{
		'cardnav':CardNav
	}
});
Vue.component('backlinkmenu',{
	props:['links','depth'],
	//props:['setname','closeme','depth','rawid','label'],
	methods:{
		decodelink(link){
			const tdb=link[0];
			const vpl=unpackmataddr(link[1]);
			const fn=getdbbookname(tdb,vpl[0]);
			return fn+":"+vpl[1];
		}
	},
	render(h){
		const children=this.links?this.links.map( link=>{
			const rawid=this.decodelink(link);
			const setname=link[0];
			const depth=this.depth+1;
			const label=matlabel(rawid);
			return h("paralleltextbutton",
				{props:{command:this.command,rawid,label,setname,depth}})
		}):[];
		return h('div',{},children)
	}

})

Vue.component('card', { 
	props:['rawid','depth','fetched','command'],
	methods:{
		onnote(note){
			alert(note)
		},
		fetch(){
			const dbname=filename2set(this.rawid);
			const obj={parseId,rawid:this.rawid};
			Dengine.readpage(dbname,obj,(res,db)=>{
				this.db=db;
				if (!this.gettoc) this.gettoc=db.gettoc;
				this.rawtext=res;
				if (this.fetched) this.fetched(res);

				this.backlinks=db.getbacklinks(this.rawid);
			});	
			this.prevrawid=this.rawid;	
		},
		execcommand(cmd){
			let r=null;
			if (this.command) r=this.command(cmd);
			//if (r)return;

			if (cmd=='toggletranslate') {
				this.autotranslate=!this.autotranslate;
			}
		}
	},
	data(){
		return {rawtext:null,prevrawid:'',backlinks:[],autotranslate:false}
	},

	render(h){
		if (this.prevrawid!==this.rawid) {
			this.fetch();
		}
		if (!this.rawtext) {
			return h("span",{},"Loading "+this.rawid)
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
				for (var i=0;i<text.length;i++){
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
					t+=text[i];
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
			{props:{db:this.db,depth,rawid:this.rawid,command:this.execcommand}}));
		children.push(h('backlinkmenu',
			{class:"backlinkmenu",props:{links:this.backlinks,depth}}));

		let cls='card0';
		if (this.depth) cls="card";
		if (this.autotranslate) cls+=' unknown';
		return h("div",{class:cls},children);
	}
})