require("./card");
require("./tocpopup");
require("./dictionary");
const {stringify}=require("dengine")

Vue.component("cards",{
	props:{'seltext':{type:String},
			'addrs':{type:Array,required:true},
			'setaddrs':{type:Function,required:true},
			'ready':{type:Boolean,required:true}
	},
	data(){
		return {prevseltext:'',dictshown:false,address:null}
	},
	methods:{
		hidedictionary(){
			this.dictshown=false;
		},
		fetched(res,cap,cardid){
			const arr=this.address.map((addr,idx)=>idx==cardid?cap.stringify():addr);
			this.setaddrs(arr);
		},
		closecard(cardid){
			this.address=this.address.filter((addr,idx)=>cardid!==idx);
			this.setaddrs(this.address);
		},
		newcard(cap){
			this.address.unshift(cap.stringify());
			this.setaddrs(this.address);
		}
	},
	render(h){
		if (!this.ready){
			return h("div",{},"opening database");
		} else if (!this.address){
			this.address=this.addrs;
		}
		const children=this.address.map((addr,cardid)=>{
			return h("card",{props:{cardid,addr,
				fetched:this.fetched,
				close:this.closecard,newcard:this.newcard}});
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