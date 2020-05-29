Vue.component('bookmarklist',{
	props:{
		'setrawid':{type:Function,required:true}
	},
	methods:{
		onselect(event){
			this.setrawid(event.target.selectedOptions[0].attributes.rawid.value);
		}
	},
	data(){
		return {bookmarks:[
			["聖求經","s0201mp272"],
			["轉法輪經","s0305mp1081"]
		]};
	},
	render(h){
		const children=this.bookmarks.map(bm=>{
			return h("option",{attrs:{rawid:bm[1]}},bm[0])
		})
		children.unshift(h("option",{},"書籤"));
		return h("select",{on:{input:this.onselect},
			class:"bookmarklist"},children);
	}
});