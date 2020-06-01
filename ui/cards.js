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
		},
		fetched(res,newid,cardid){
			const arr=this.addrs.map((addr,idx)=>idx==cardid?newid:addr);
			this.setaddrs(arr);
		}
	},
	render(h){
		const children=this.addrs.map((addr,cardid)=>{
			return h("card",{props:{cardid,addr,fetched:this.fetched}});
		})
		const out=[h("div",{class:"cards"},children)];
		if (this.prevseltext!==this.seltext||this.dictshown){
			if(this.seltext.length>1&&this.seltext.indexOf(" ")==-1){
				this.prevseltext=this.seltext;
				this.dictshown=true;
				out.unshift(h("dictionarypopup",{
					props:{close:this.hidedictionary,seltext:this.seltext}}));
			}
		}
		return h("div",{},out);
	}
})