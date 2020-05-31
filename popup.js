Vue.component("fullscreenpopup",{
	props:['content','close'],
	render(h){
		let content=this.content;
		if (!Array.isArray(content) ) content=[content];
		return h("div",{on:{click:this.close},class:"fullscreenpopup"},
			[h("div",{class:"popupcontent"},content)]
		)
	}
})