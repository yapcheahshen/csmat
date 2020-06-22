'use strict'
const {parseCAP}=require("pengine");
const {getancestor}=require("./tocpopup");
const {makecanonref}=require("./canonref");
const BACKLINKSEP="|";
const CardNav=Vue.extend({
	props:['cap','command'],
	methods:{
		inputparanum(event){
			//TODO mn1 short cut
			if (event.key=="Enter"){
				//allow x100 for line number
				const v=event.srcElement.value.trim(); 
				if (v.indexOf("_")>-1) {
					const cap=parseCAP(v);
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
	render(h){
		const children=this.links?this.links.map( link=>{
			const cap=parseCAP(link[0]);
			const depth=this.depth+1;
			const addr=cap.stringify().replace(/[yz].*/,'');
			const label=makecanonref(cap);
			const displayline=(cap.z)?-1:null;
			const quoting=this.cap.stringify()+BACKLINKSEP+cap.stringify();
			return h("cardbutton",
				{props:{command:this.command,cardcommand:this.cardcommand,
					quoting,addr,label,depth,displayline}})
		}):[];
		return h('div',{},children)
	}

})