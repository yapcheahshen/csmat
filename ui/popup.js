'use strict';
Vue.component("fullscreenpopup",{
	props:['content','close'],
	methods:{
		nothing(event){
			event.stopPropagation();
		}
	},
	render(h){
		let content=this.content;
		if (!Array.isArray(content) ) content=[content];
		return h("div",{on:{click:this.close},class:"fullscreenpopup"},
			[h("div",{class:"popupcontent",on:{click:this.nothing}},content)]
		)
	}
})