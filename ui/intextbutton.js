'use strict'
const BACKLINKSEP="|";
const {makecanonref}=require("./canonref");
const {parseCAP,readlines}=require("pengine");
const {getparallel,matlabel}=require("./fetch");
Vue.component('notebutton',{
	props:['note','id','depth','command','cardcommand'],
	methods:{
		toggle(){
			this.show=!this.show;
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
				const cap=parseCAP(addr);
				const label=makecanonref(cap);

				children.push( h("forwardlink",
					{props:{cap:this.cap,addr,depth:this.depth,
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
	props:['cap','addr','depth','label','command','cardcommand','displayline'
	,'quoting'],
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
				command:this.execcommand,from:this.cap,displayline:this.displayline,
				cardcommand:this.cardcommand,addr :this.addr,quoting:this.quoting}});
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
Vue.component("forwardlink",{
	props:{
		addr:{type:String},
		label:{type:String},
		command:{type:Function},
		cardcommand:{type:Function},
		show:{type:Boolean},
		depth:{type:Number},
		forwardlink:{type:String},
		quotecap:{type:String}
	},
	methods:{
		execcommand(arg){
			if (arg=="close") {
				this.command("setforwardlink",'');
				return;
			}
			this.command(arg);
		},
		openforwardlink(event){
			//const s='cs0att@7_x427y105z29|x1y294z29'
			if (this.quotecap) {
				const cap=parseCAP(this.addr);
				readlines(cap.db,cap.x0,1,function(res){ //prepare for diff
					this.command("setforwardlink",this.addr+"|"+this.quotecap)
				}.bind(this));
			}
		}
	},
	render(h){
		if (this.addr+"|"+this.quotecap==this.forwardlink) {
			const addr=this.addr.replace(/[yz].*/,'');
			const props={displayline:-1,addr,quoting:this.quotecap+"|"+this.addr
				,command:this.execcommand,cardcommand:this.cardcommand,
				label:this.label,depth:(this.depth||0)+1};
			return h("card",{props});
		} else {
			return h("button",{attrs:{addr:this.addr}
				,on:{click:this.openforwardlink}},this.label);
		}
	}
})
Vue.component("backlinkbtn",{
	//	functional:true,
	props:{
		link:{type:String},
		depth:{type:Number},
		command:{type:Function},
	},
	mounted(){
		let addr=this.link;
		const command=this.command;
		const depth=(this.depth||0)+1
		const at=addr.indexOf(BACKLINKSEP);
		if (at>-1) addr=addr.substr(0,at);
		this.cap=parseCAP(addr);
		this.label=makecanonref(this.cap);
	},
	data(){
		return {label:'',cap:null}
	},
	methods:{
		openbacklink(event){
			readlines(this.cap.db,this.cap.x0,1,function(res){ //prepare for diff
				this.command("setbacklink",this.link)
			}.bind(this));
		}
	},
	render(h) {
		return h("button",{class:"backlinkbtn",
			on:{click:this.openbacklink}},this.label);

	}
})

