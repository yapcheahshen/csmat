const getancestor=(db,id)=>{
	let ancestor=[];
	if (id){
		const m=id.match(/(.+?):(\d+)/);
		if (!m)return [];
		let bookseq=parseInt(m[1]);
		if (bookseq.toString()!==m[1]){
			bookseq=db.bookname2seq(m[1]);
		}

		ancestor=db.gettocancestor(bookseq+":"+m[2]).
			filter(item=>item.t!="-");
	} 
	return ancestor;
}

const Siblings=Vue.extend({
	props:['db','firstsibling','thissibling','onselect'],
	methods:{
		selectitem(event){
			const tocseq=parseInt(event.srcElement.attributes.tocseq.value);
			this.onselect(tocseq);
		},

		getsiblings(){
			const toc=this.db.gettoc();
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

			const attrs={tocseq:item[0]};
			return h("tr",{on:{click:this.selectitem},class:cls},
				[h("td",{attrs},t1),h("td",{attrs},t2)]);
		});
		return h("table",{class:"siblings"},children);
	}

})
Vue.component('tocitempopup',{
	props:['db','tid','depth','onselecttocitem'],
	methods:{
		closepopup(){
			this.onselecttocitem('');
		},
		onselect(tocseq){
			const toc=this.db.gettoc();
			const tocitem=toc[tocseq];
			if (toc[tocseq+1].d>tocitem.d){//has children
				this.curdepth=toc[tocseq+1].d;
				this.curid=toc[tocseq+1].l;
			} else {
				this.onselecttocitem(tocitem.l);
			}
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
		return {curid:'',previd:'',curdepth:0,prevdepth:0};
	},
	render(h){
		if (this.prevdepth!==this.depth){
			this.curdepth=this.depth;
		}
		if (this.previd!==this.tid) {
			this.curid=this.tid;
		}
		this.prevdepth=this.depth;
		this.previd=this.tid;

		const ancestor=getancestor(this.db,this.curid);
		const toc=this.db.gettoc();
		
		const curitem=ancestor.filter(item=>item.d>=this.curdepth)[0];
		const firstsibling=curitem.first;
		const thissibling=curitem.cur;
		const props={db:this.db,onselect:this.onselect
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