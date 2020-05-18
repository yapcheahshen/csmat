const palidiff=require("./diff");
const input=
`Atha kho saccako nigaṇṭhaputto buddhappamukhaṃ bhikkhusaṅghaṃ paṇītena khādanīyena bhojanīyena sahatthā santappesi sampavāresi.
Atha kho bodhi rājakumāro buddhappamukhaṃ bhikkhusaṅghaṃ paṇītena khādanīyena bhojanīyena sahatthā santappesi sampavāresi.`
const lines=input.split(/\n/);

const d1=palidiff(lines[0],lines[1]);
console.log(d1)