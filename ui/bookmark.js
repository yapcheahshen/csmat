'use strict';
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
			['hilight text','s0102a_137x1y105z29*s0201m_273x1y294z29'],
			["聖求經","s0201m_273"],
			["象跡喻小經ATT","s0201m_289"],
			["心材喻小經 ATT an3.138","s0201m_312"],
			["轉法輪經","s0305m_1081"],
			["無我相經 ","s0303m_x305"],
			["燃燒經","s0304m_x81"],
			["語句與正法住立","s0402m1_21"]
		]};

//sujato suggest beginner to read
//SN 56.11 SN22.59 SN35.28 


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