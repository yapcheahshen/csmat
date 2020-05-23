Vue.component('maintext', { 
	props:['rawtext'],
	methods:{
		onnote(note){
			alert(note)
		}
	},
	render(h){
		const notes={};
		this.rawtext.map(item=>{
			if (item[2]) { //has note
				let ns=item[2].split("^^");
				for (var i=0;i<ns.length;i++){
					const m=ns[i].match(/^\d+\^/);
					notes[m[0].substr(0,m[0].length-1)]=ns[i].substr(m[0].length);		
				}
			} 
		})

		let text=this.rawtext.map(item=>{
			return item[1];
		}).join("<br>");

		text=text.replace(/.\ ([A-Z])/g,".<br> $1");

		const children=[];
		let p=0;
		text.replace(/<(.+?)>/g,(m,m1,p1)=>{
			const t=text.substring(p,p1);
			if (t) children.push( h('span',t));
			if (m1=="br") {
				children.push(h('br'));
			} else {

			}
			p=p1+m.length;
		})
		children.push(h('span',text.substr(p)));


		return h("div",{class:"maintext"},children);
	}
})