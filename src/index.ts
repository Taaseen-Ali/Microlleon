import {
  WalletClient,
  BeaconMessageType,
  PermissionScope,
  PermissionResponseInput,
  OperationResponseInput,
  TezosTransactionOperation,
} from '@airgap/beacon-sdk';
import * as conseiljs from 'conseiljs';

const faucetAccount = {
  mnemonic: [
    'humor',
    'diet',
    'boy',
    'length',
    'close',
    'jacket',
    'guard',
    'orphan',
    'sausage',
    'clarify',
    'dentist',
    'reveal',
    'certain',
    'asset',
    'scissors',
  ],
  secret: '7ce8e614938d6c5fab303361cb07895e3f495a66',
  amount: '83836587124',
  pkh: 'tz1P5fefzbuvp5YKMgz5UkFwNmrQQfpBvSX3',
  password: 'NOJk66YzP7',
  email: 'wqjjrbzk.czcrjkwk@tezos.example.org',
};

async function createAccount() {
  const keystore = await conseiljs.TezosWalletUtil.unlockFundraiserIdentity(
    faucetAccount.mnemonic.join(' '),
    faucetAccount.email,
    faucetAccount.password,
    faucetAccount.pkh
  );

  return keystore;
}

const connectApp = async (): Promise<void> => {
  const keystore = await createAccount();
  console.log(`account id: ${keystore.publicKeyHash}`);
  console.log(`public key: ${keystore.publicKey}`);
  console.log(`secret key: ${keystore.privateKey}`);

  const client = new WalletClient({ name: 'My Wallet' });
  await client.init(); // Establish P2P connection
  const data = {
    name: 'Beacon Example Dapp',
    publicKey: '2ec9b3815f0561141e33fdea35813a0dc766358c27c3f878c6445a626718955f',
    relayServer: 'matrix.papers.tech',
  };

  setTimeout(() => client.addPeer(data), 2000);
  console.log('here');

  client
    .connect(async (message) => {
      console.log('beacon message', message);

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

        await client.respond(response);
      } else if (message.type === BeaconMessageType.OperationRequest) {
        const tezosNode = 'https://tezos-dev.cryptonomic-infra.tech:443';

        const result = await conseiljs.TezosNodeWriter.sendTransactionOperation(
          tezosNode,
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

        await client.respond(response);
      }
    })
    .catch((error) => console.error('connect error', error));
};

connectApp().catch((error) => console.error('connect error', error));

/*
   name: "Beacon Extension"
   publicKey: "40529d19383e61830904579c05c4b9e72c01d83f6c3cb31dfabd2f7f9ef04c31"
   relayServer: "matrix.papers.tech"
 */
