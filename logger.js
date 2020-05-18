Vue.component('logger',{
	props:{
		'log':{type:Array,required:true},
		'clear':{type:Function}
	},
	template:`<div>
			<li v-for="msg in log">{{msg}}</li>
			<button @click="clear">Clear</button>
		</div>
	`,
	methods:{
	}
});