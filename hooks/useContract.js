import Web3 from "web3";
import MyTokenABI from "../contracts/MyToken.json";

export const useContract = (web3, address) => {
    if (!web3 || !address) return null;

    const contract = new web3.eth.Contract(MyTokenABI, address);

    // Helper functions for contract interactions
    return {
        contract,

        // View functions
        async name() {
            return await contract.methods.name().call();
        },

        async symbol() {
            return await contract.methods.symbol().call();
        },

        async decimals() {
            return await contract.methods.decimals().call();
        },

        async totalSupply() {
            return await contract.methods.totalSupply().call();
        },

        async balanceOf(account) {
            return await contract.methods.balanceOf(account).call();
        },

        async allowance(owner, spender) {
            return await contract.methods.allowance(owner, spender).call();
        },

        async nonces(owner) {
            return await contract.methods.nonces(owner).call();
        },

        async DOMAIN_SEPARATOR() {
            return await contract.methods.DOMAIN_SEPARATOR().call();
        },

        async eip712Domain() {
            return await contract.methods.eip712Domain().call();
        },

        // Transaction functions
        async transfer(to, value, from) {
            // Convert value to proper format if it's not already in wei
            const valueInWei = web3.utils.isHexStrict(value) ? value : web3.utils.toWei(value, 'ether');
            return await contract.methods.transfer(to, valueInWei).send({ from });
        },

        async transferFrom(fromAddr, to, value, from) {
            const valueInWei = web3.utils.isHexStrict(value) ? value : web3.utils.toWei(value, 'ether');
            return await contract.methods.transferFrom(fromAddr, to, valueInWei).send({ from });
        },

        async approve(spender, value, from) {
            const valueInWei = web3.utils.isHexStrict(value) ? value : web3.utils.toWei(value, 'ether');
            return await contract.methods.approve(spender, valueInWei).send({ from });
        },

        async permit(owner, spender, value, deadline, v, r, s, from) {
            const valueInWei = web3.utils.isHexStrict(value) ? value : web3.utils.toWei(value, 'ether');
            return await contract.methods.permit(owner, spender, value, deadline, v, r, s).send({ from });
        },

        // Utility functions
        formatBalance(balance, decimals = 18) {
            return web3.utils.fromWei(balance.toString(), 'ether');
        },

        parseAmount(amount, decimals = 18) {
            return web3.utils.toWei(amount.toString(), 'ether');
        },

        // Validation helpers
        isValidAddress(address) {
            return web3.utils.isAddress(address);
        }
    };
};
