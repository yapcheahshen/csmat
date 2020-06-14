'use strict';

Vue.component("dictionary",{
	props:["seltext"],
	render(h){
		return h('div',{},this.seltext);
	}
});
Vue.component("dictionarypopup",{
	props:['close','seltext'],
	render(h){
		const content=h("dictionary",{props:{seltext:this.seltext}});
		return h("fullscreenpopup",{props:{close:this.close,
			content}});
	}
});