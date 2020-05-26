/*
	nestable text

*/
const {SEGSEP}=require("dengine");
const {parseId,vpl2paranum,getparallel,matlabel}=require("./fetch");
const {filename2set,hyperlink_regex_g}=require("./linkparser");
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
		return {show:false} 
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
					{props:{rawid,depth:this.depth,closeme:this.closeme,
						setname,label}}));
				prev=idx+m.length;
			});
			let t=notetext.substr(prev)
			if (t) children.push( h('span',{},t));
			children.unshift(h('button',{on:{click:this.toggle}},'x'));

			return h('span',{class:'inlinenote'},children);

		} else{
			return h('span',{class:'notebutton',on:{click:this.toggle}},"※");
		}
	}
})

Vue.component('paralleltextbutton',{
	props:['setname','closeme','depth','rawid','label'],
	methods:{
		toggle(){
			this.show=!this.show;
		}
	},
	render(h){
		if (!this.show){
			return h('button',{on:{click:this.toggle}},
				this.label?this.label:this.setname);
		} else {
			const rawid=getparallel(this.setname,this.rawid);
			return h('maintext',{props:{depth:this.depth+1,
				closeme:this.toggle,rawid }});
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

Vue.component('topleveltextmenu',{
	props:['depth','closeme','rawid'],
	render(h){
		const sets=["att","tik"];
		const children=sets.map(setname=>h("paralleltextbutton",
			{props:{setname,rawid:this.rawid,
				closeme:this.closeme,depth:this.depth+1}}))
		return h("div",{},children);
	}
})
Vue.component('textmenu',{
	props:['depth','closeme','rawid'],
	methods:{
		onclose(){
			this.closeme()
		}
	},
	render(h){
		const attr={on:{click:this.onclose},props:{rawid:this.rawid,depth:this.depth}};
		if (this.depth==0) {
			return h("topleveltextmenu",attr);
		}
		return h("button",attr,"close");
	}
});


Vue.component('maintext', { 
	props:['rawid','depth','closeme','fetched'],
	methods:{
		onnote(note){
			alert(note)
		},
		fetch(){
			const dbname=filename2set(this.rawid);
			const obj={parseId,rawid:this.rawid};
			Dengine.readpage(dbname,obj,(res,db)=>{
				if (!this.gettoc) this.gettoc=db.gettoc;
				this.rawtext=res;
				if (this.fetched) this.fetched(res);
			});	
			this.prevrawid=this.rawid;	
		},
	},
	data(){
		return {rawtext:null,prevrawid:''}
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

		let text=this.rawtext.map((item,idx)=>{
			let t=item[1];
			t=t.replace(/\^\d+/g,(m,m1)=>"<"+idx+"_"+m.substr(1)+">" );
			return t;
		}).join("<br>");
		//text=text.replace(/.\ ([A-Z])/g,".<br> $1");
		//render xref at the line
		

		const children=[];
		let p=0;
		text.replace(/<(.+?)>/g,(m,m1,p1)=>{
			const t=text.substring(p,p1);
			if (t) children.push( h('span',t));
			if (m1=="br") {
				children.push(h('br'));
			} else {
				const note=notes[m1];
				if (note) {
					children.push(h('notebutton',{props:{id:m1,note,depth:depth+1}}));
				} else {
					children.push(h('xrefbutton',{props:{xref:m1,openxref:this.openxref}}))
				}
			}
			p=p1+m.length;
		})

		children.push(h('span',text.substr(p)));
		children.unshift(h('textmenu',{props:{depth,closeme:this.closeme,rawid:this.rawid}}));

		let cls='maintext0';
		if (this.depth) cls="maintext";
		return h("div",{class:cls},children);
	}
})