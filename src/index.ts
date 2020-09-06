import * as conseiljs from 'conseiljs';
import * as faucetAccount from '../accounts/acc1.json';
import {
    WalletClient,
    BeaconMessageType,
    PermissionScope,
    PermissionResponseInput,
    OperationResponseInput,
    TezosTransactionOperation,
} from '@airgap/beacon-sdk';

const Store = window.require('electron-store');
const store = new Store();
const TEZOS_NODE = 'https://tezos-dev.cryptonomic-infra.tech:443';
const client = new WalletClient({ name: 'My Wallet' });


async function createAccount() {
    const keystore = await conseiljs.TezosWalletUtil.unlockFundraiserIdentity(
	faucetAccount.mnemonic.join(' '),
	faucetAccount.email,
	faucetAccount.password,
	faucetAccount.pkh
    );
    return keystore;
}

async function connectApp() : Promise<void> {
    const keystore = await createAccount().catch(err => console.error(err));
    await client.init(); // Establish P2P connection
    try {
	await client.addPeer(JSON.parse((<HTMLInputElement>document.getElementById("qr_data")).value))
    } catch (e) {
	console.log("QR data not provided. Skipping")
    }

    await addPeers();
    /* setTimeout(() => client.addPeer(qrData), 2000); */
    
    client
 	.connect(async (message) => {
 	    await client.respond((await handleMessage(keystore, message)));
 	    console.log("peers", await client.getPeers());
 	})
 	.catch((error) => console.error('connect error', error));
}

async function handleMessage(keystore, message) {
    // Let's assume it's a permission request, but we obviously need to handle all request types
    if (message.type === BeaconMessageType.PermissionRequest) {
        // Here we would show a UI to the user where he can confirm everything that has been requested in the beacon message
        // We hardcode a response
        const response: PermissionResponseInput = {
 	    type: BeaconMessageType.PermissionResponse,
 	    network: message.network, // Use the same network that the user requested
 	    scopes: [PermissionScope.OPERATION_REQUEST], // Ignore the scopes that have been requested and instead give only operation permissions
 	    id: message.id,
 	    publicKey: keystore.publicKey,
        };
 	return response
    } else if (message.type === BeaconMessageType.OperationRequest) {
        const result = await conseiljs.TezosNodeWriter.sendTransactionOperation(
 	    TEZOS_NODE,
 	    keystore,
 	    (message.operationDetails[0] as TezosTransactionOperation).destination,
 	    parseInt((message.operationDetails[0] as TezosTransactionOperation).amount, 10),
 	    50000,
 	    ''
        );
 	
 	console.log(`Injected operation group id ${result.operationGroupID}`);
        const response: OperationResponseInput = {
 	    type: BeaconMessageType.OperationResponse,
 	    id: message.id,
 	    transactionHash: result.operationGroupID,
        };
 	return response
    } 
}
function appendChecklistOption(div, peer) {
    let input = document.createElement("input");
    input.type = "checkbox";
    input.value = peer.publicKey;
    input.name = peer.name;
    input.id = peer.publicKey;
    let label = document.createElement("label");
    label.setAttribute("for", input.id);
    label.innerHTML = input.id
    div.appendChild(input)
    div.appendChild(label)
    div.appendChild(document.createElement("br"));
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

async function addPeers() {
    const checkboxes = Array.from(document.getElementById("checklist")
			       .querySelectorAll("input"));
    const selected = checkboxes.filter(box => box.checked)
	      .map(box => box.value);

    for (let key of selected) {
	await client.addPeer(
	    store.get("peers")
		 .find(peer => peer.publicKey === key)
	);
    }
}

async function removePeers() {
    await client.removeAllPeers();
    console.log("Removed all peers from local storage");
}

async function loadPeers() {
    const peers = store.get('peers');
    const div = document.getElementById("checklist");
    removeAllChildNodes(div);
    for (let peer of peers) {
	appendChecklistOption(div, peer);
    }
}

async function showPeers() {
    console.log("peers", await client.getPeers());
}

async function savePeers() {
    const currPeers = await client.getPeers();
    store.set('peers', currPeers);
}

document.getElementById("btn_connect").addEventListener("click", (e:Event) => connectApp());
document.getElementById("btn_remove_peers").addEventListener("click", (e:Event) => removePeers());
document.getElementById("btn_load_peers").addEventListener("click", (e:Event) => loadPeers());
document.getElementById("btn_show_peers").addEventListener("click", (e:Event) => showPeers());
document.getElementById("btn_save_peers").addEventListener("click", (e:Event) => savePeers());
