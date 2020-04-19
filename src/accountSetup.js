const faucetAccount = {
    "mnemonic": [
	"humor",
	"diet",
	"boy",
	"length",
	"close",
	"jacket",
	"guard",
	"orphan",
	"sausage",
	"clarify",
	"dentist",
	"reveal",
	"certain",
	"asset",
	"scissors"
    ],
    "secret": "7ce8e614938d6c5fab303361cb07895e3f495a66",
    "amount": "83836587124",
    "pkh": "tz1P5fefzbuvp5YKMgz5UkFwNmrQQfpBvSX3",
    "password": "NOJk66YzP7",
    "email": "wqjjrbzk.czcrjkwk@tezos.example.org"
}

async function createAccount() {
    const mnemonic = conseiljs.TezosWalletUtil.generateMnemonic();
    console.log(`mnemonic: ${mnemonic}`);
    const keystore = await conseiljs.TezosWalletUtil.unlockIdentityWithMnemonic(mnemonic, '');
    console.log(`account id: ${keystore.publicKeyHash}`);
    console.log(`public key: ${keystore.publicKey}`);
    console.log(`secret key: ${keystore.privateKey}`);
}

createAccount();
