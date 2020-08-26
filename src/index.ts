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

const TEZOS_NODE = 'https://tezos-dev.cryptonomic-infra.tech:443';


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
    const keystore = await createAccount();
    console.log(`account id: ${keystore.publicKeyHash}`);
    console.log(`public key: ${keystore.publicKey}`);
    console.log(`secret key: ${keystore.privateKey}`);

    const client = new WalletClient({ name: 'My Wallet' });
    await client.init(); // Establish P2P connection
    /* const data = JSON.parse((<HTMLInputElement>document.getElementById("qr_data")).value) */
    console.log(qrData)
    setTimeout(() => client.addPeer(qrData), 2000);

    client
	.connect(async (message) => { await client.respond((await handleMessage(keystore, message))) })
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


document.getElementById("btn_connect").addEventListener("click", (e:Event) => connectApp());

