const {getLink} = require('electron').remote.require('./main.js');
const url = new URL(getLink());
const data = {name: url.searchParams.get("name"),
	      publicKey: url.searchParams.get("publicKey"),
	      relayServer: url.searchParams.get("relayServer")}

document.getElementById("qr_data").value = JSON.stringify(data);
