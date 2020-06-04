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
		cardcommand(cmd,cardid,arg1,arg2){
			if (cmd=="fetched"){
				const arr=this.address.map((addr,idx)=>idx==cardid?cap.stringify():addr);
				this.setaddrs(arr);				
			} else if (cmd=="close"){
				this.address=this.address.filter((addr,idx)=>cardid!==idx);
				this.setaddrs(this.address);				
			} else if (cmd=="new"){
				this.address.unshift(arg1.stringify());
				this.setaddrs(this.address);
			}
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
				cardcommand:this.cardcommand,
			}});
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