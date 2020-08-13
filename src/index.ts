import { WalletClient, BeaconMessageType, PermissionScope, PermissionResponseInput } from '@airgap/beacon-sdk'

const connectApp = async (): Promise<void> => {
    const client = new WalletClient({ name: 'My Wallet' })
    await client.init() // Establish P2P connection
    const data = {name:"Beacon Example Dapp",
	  	  publicKey:"f94176e15944aff5dd2073ce7a34a0e1ba657593e9afa6cdeda9ad985a601b49",
		  relayServer:"matrix.papers.tech"}

    setTimeout(() => client.addPeer(data), 2000);
    console.log("here")

    client
	   .connect(async (message) => {
	    console.log('beacon message', message)

	    // Let's assume it's a permission request, but we obviously need to handle all request types
	    if (message.type === BeaconMessageType.PermissionRequest) {
		// Here we would show a UI to the user where he can confirm everything that has been requested in the beacon message

		// We hardcode a response
		const response: PermissionResponseInput = {
		    type: BeaconMessageType.PermissionResponse,
		    network: message.network, // Use the same network that the user requested
		    scopes: [PermissionScope.OPERATION_REQUEST], // Ignore the scopes that have been requested and instead give only operation permissions
		    id: message.id,
		    publicKey: 'tezos public key'
		}

		await client.respond(response)
	    }
	})
	.catch((error) => console.error('connect error', error))
}

connectApp().catch((error) => console.error('connect error', error))

/*
   name: "Beacon Extension"
   publicKey: "40529d19383e61830904579c05c4b9e72c01d83f6c3cb31dfabd2f7f9ef04c31"
   relayServer: "matrix.papers.tech"
 */
