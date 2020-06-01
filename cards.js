require("./card");
require("./tocpopup");
require("./dictionary");

Vue.component("cards",{
	props:{'seltext':{type:String},
			'addrs':{type:Array,required:true},
			'setaddrs':{type:Function,required:true}
	},
	data(){
		return {prevseltext:'',dictshown:false}
	},
	methods:{
		hidedictionary(){
			this.dictshown=false;
		}
	},
	render(h){
		const children=this.addrs.map(addr=>{
			return h("card",{props:{addr}});
		})
		const out=[h("div",{class:"cards"},children)];
		if (this.prevseltext!==this.seltext||this.dictshown){
			if(this.seltext.length>2&&this.seltext.indexOf(" ")==-1){
				this.prevseltext=this.seltext;
				this.dictshown=true;
				out.unshift(h("dictionarypopup",{
					props:{close:this.hidedictionary,seltext:this.seltext}}));
			}
		}
		return h("div",{},out);
	}
})