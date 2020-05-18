const {combinegatha}=require("./paliutil");
const data=
`<p rend="hangnum" n="18"></p>
<p rend="gatha1">G1-1</p>

<p rend="hangnum" n="20"></p>
<p rend="gatha1">G2-1</p>
<p rend="gathalast">G2-2</p>

<p rend="bodytext">Text</p>
<p rend="gatha1">G3-1</p>
<p rend="gatha2">G3-2</p>
<p rend="gathalast">G3-3</p>
`
const expected=
`<p rend="hangnum" n="18"><gatha>G1-1</gatha></p>
<p rend="hangnum" n="20"><gatha>G2-1 G2-2</gatha></p>
<p rend="bodytext">Text<gatha>G3-1 G3-2 G3-3</gatha></p>
`
out=combinegatha(data);
console.log((out==expected)?"passed":"failed")