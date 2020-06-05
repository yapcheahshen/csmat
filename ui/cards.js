require("./card");
require("./tocpopup");
require("./dictionary");
const {stringify,isPaliword}=require("dengine")

Vue.component("cards",{
	props:{	'addrs':{type:Array,required:true},//initial from hash
			'setaddrs':{type:Function,required:true},
			'ready':{type:Boolean,required:true}
	},
	data(){
		return {dictshown:false,address:null,seltext:'',prevseltext:''}
	},
	methods:{
		hidedictionary(){
			this.dictshown=false;
		},
		openbookmark(addr){
			const arr=addr.split("*")
			arr.forEach(a=>this.address.unshift(a));
			this.setaddrs(this.address);
		},
		cardcommand(cmd,cardid,arg1,arg2){
			if (cmd=="fetched"){
				const arr=this.address.map((addr,idx)=>idx==cardid?arg1.stringify():addr);
				this.setaddrs(arr);		
			} else if (cmd=="close"){
				this.address=this.address.filter((addr,idx)=>cardid!==idx);
				this.setaddrs(this.address);				
			} else if (cmd=="new"){
				this.address.unshift(arg1.stringify());
				this.setaddrs(this.address);
			} else if (cmd=="dictionary"){
				this.seltext=arg1;
			}
		}
	},
	render(h){
		if (!this.ready){
			return h("div",{},"opening database");
		} else if (!this.address){
			this.address=this.addrs;
		}

		if (!this.address||!this.address.length){
			return h("bookmarklist",
			{props:{openbookmark:this.openbookmark}});
		}

		
		let selectid=0,dictpopup=null;
		if ((this.seltext!==this.prevseltext)||this.dictshown){
				this.dictshown=true;
				dictpopup=(h("dictionarypopup",{
					props:{close:this.hidedictionary,seltext:this.seltext}}));
			this.prevseltext=this.seltext;
		}
		
		const children=this.address.map((addr,cardid)=>{
			return h("card",{props:{cardid,addr,cardcommand:this.cardcommand}});
		})
		if (dictpopup)children.unshift(dictpopup);
		const out=[h("div",{class:"cards"},children)];
	
		return h("div",{},out);
	}
})