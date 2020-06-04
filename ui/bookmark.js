Vue.component('bookmarklist',{
	props:{
		'openbookmark':{type:Function,required:true}
	},
	methods:{
		onselect(event){
			const id=event.target.selectedOptions[0].attributes.addr.value;
			this.openbookmark(id);
		}
	},
	data(){
		return {bookmarks:[
			['hilight text','s0102a_p137x1y34z'],
			["聖求經","s0201m_p272"],
			["轉法輪經","s0305m_p1081"]
		]};
	},
	render(h){
		const children=this.bookmarks.map(bm=>{
			return h("option",{attrs:{addr:bm[1]}},bm[0])
		})
		children.unshift(h("option",{},"書籤"));
		return h("select",{on:{input:this.onselect},
			class:"bookmarklist"},children);
	}
});