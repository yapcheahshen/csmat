Vue.component("dictionary",{
	props:["msg","seltext"],
	render(h){
		return h('div',{},this.seltext);
	}
});
Vue.component("dictionarypopup",{
	props:['close','seltext'],
	render(h){
		const content=h("dictionary",{props:{msg:"hello",seltext:this.seltext}});
		return h("fullscreenpopup",{props:{close:this.close,
			content}});
	}
});