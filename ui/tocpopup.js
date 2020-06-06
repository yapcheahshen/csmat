const {parse}=require("dengine");
const getancestor=(cap)=>{
	let ancestor=[];
	ancestor=cap.db.gettocancestor(cap.bkx).filter(item=>item.t!="-");
	return ancestor;
}

const Siblings=Vue.extend({
	props:['cap','firstsibling','thissibling','onselect'],
	methods:{
		selectitem(event){
			const tocseq=parseInt(event.srcElement.attributes.tocseq.value);
			this.onselect(tocseq);
		},

		getsiblings(){
			const toc=this.cap.db.gettoc();
			let cur=this.firstsibling;
			let n=toc[cur];
			const out=[];
			const d=n.d;
			while (cur<toc.length&&n.d==d){
				const leaf=toc[cur+1]&&(toc[cur+1].d==d||toc[cur+1].d<d)
				out.push([cur,n.t,n.l,leaf]);
				if (n.n) {
					cur=n.n
				} else {
					cur++					
				}
				n=toc[cur];
			}
			return out;
		}

	},
	render(h){
		const children=this.getsiblings(this.firstsibling).map(item=>{
			let cls='tocitem';
			if (item[0]==this.thissibling) {
				cls+=" active"
			}
			const isleaf=item[3]?"→":"";

			let at=item[1].indexOf("|");
			if (at==-1)at=item[1].length;
			const t1=item[1].substr(0,at);
			const t2=item[1].substr(at+1)+isleaf;

			const toccap=parse(item[2],this.cap.db);
			const title=toccap.stringify().replace(/_.+/,'')+"|"+toccap.bkseq+":"+toccap.bk0;
			const attrs={tocseq:item[0],title};
			return h("tr",{on:{click:this.selectitem},class:cls},
				[h("td",{attrs},t1),h("td",{attrs},t2)]);
		});
		return h("table",{class:"siblings"},children);
	}

})
Vue.component('tocitempopup',{
	props:['cap','depth','onselecttocitem'],
	methods:{
		closepopup(){
			this.onselecttocitem('');
		},
		onselect(tocseq){
			const toc=this.cap.db.gettoc();
			const tocitem=toc[tocseq];
			if (toc[tocseq+1].d<=tocitem.d){
				this.onselecttocitem(tocitem.l);
				return;
			}
			let l=tocitem.l;
			//go deepest
			if (tocseq<toc.length &&toc[tocseq+1].d>toc[tocseq].d){
				tocseq++;
				this.curdepth=toc[tocseq].d;
				l=toc[tocseq].l;
			}
			this.curcap=parse(l,this.cap.db);
		},
		quickselect(event){
			const linkto=event.srcElement.attributes.linkto.value;
			this.onselecttocitem(linkto);
		},
		changedepth(event){
			const depth=parseInt(event.srcElement.attributes.depth.value);
			this.curdepth=depth;
		}
	},	
	data(){
		return {curcap:this.cap,curdepth:this.depth};
	},
	render(h){
		const ancestor=getancestor(this.curcap);
		const toc=this.curcap.db.gettoc();
		
		const curitem=ancestor.filter(item=>item.d>=this.curdepth)[0];
		const firstsibling=curitem.first;
		const thissibling=curitem.cur;
		const props={cap:this.curcap,onselect:this.onselect
			,thissibling,firstsibling};
		const depth=curitem.d;

		const ancestorspan=ancestor.map((item,idx)=>{
			let t=item.t;
			const at=t.indexOf("|");
			const cls= (depth==item.d)?"ancestor_active":"ancestor";
			if (at>-1) t=t.substr(at+1);
			return h("span",{class:cls,
				attrs:{depth:item.d},
				on:{click:this.changedepth}},"/"+t);
		})
		ancestorspan.push(h("button",{attrs:{linkto:curitem.l},
			on:{click:this.quickselect}},"→"));

		return h("fullscreenpopup",{props:{close:this.closepopup,
			content:[
			h("div",{class:"ancestor"},ancestorspan),
			h("siblings",{props})
			]}});
	},
	components:{
		"siblings":Siblings
	}
})

module.exports={getancestor}