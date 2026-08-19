import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xd96a39B15b2bb4E65BF09bf27A53165fEA637114';

export const CHAIN_ID_HEX = '0x' + studionet.id.toString(16);

export async function ensureGenLayerNetwork() {
  if (!window.ethereum) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  } catch (err) {
    if (err.code === 4902 || err.code === -32603 || (err.message && err.message.includes('Unrecognized chain'))) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: CHAIN_ID_HEX,
          chainName: 'GenLayer Studionet',
          nativeCurrency: { name: 'GEN Token', symbol: 'GEN', decimals: 18 },
          rpcUrls: ['https://studio.genlayer.com/api'],
          blockExplorerUrls: ['https://genlayer-explorer.vercel.app'],
        }],
      });
    }
  }
}

class ContractService {
  constructor() {
    this.contractAddress = CONTRACT_ADDRESS;
    this.client = createClient({ chain: studionet });
  }

  getClient(accountAddress) {
    if (accountAddress) {
      return createClient({
        chain: studionet,
        account: accountAddress.toLowerCase(),
      });
    }
    return this.client;
  }

  async getTasks() {
    try {
      const rawRes = await this.client.readContract({
        address: this.contractAddress,
        functionName: 'get_all_tasks',
        args: [],
      });
      if (!rawRes) return [];
      const parsed = typeof rawRes === 'string' ? JSON.parse(rawRes) : rawRes;
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to fetch tasks from GenLayer on-chain:', err);
      return [];
    }
  }

  async getTaskById(id) {
    const tasks = await this.getTasks();
    return tasks.find(t => t.id === id);
  }

  async createTask({ taskId, mediaUrl, targetLang, guidelines, blacklistWords, escrowAmount, senderAddress }) {
    await ensureGenLayerNetwork();
    const client = this.getClient(senderAddress);
    
    // Convert input escrow amount to BigInt
    const val = BigInt(escrowAmount);

    const hash = await client.writeContract({
      address: this.contractAddress,
      functionName: 'create_task',
      args: [taskId, mediaUrl, targetLang, guidelines, blacklistWords],
      value: val,
    });

    await this.client.waitForTransactionReceipt({ hash });
    return this.getTaskById(taskId);
  }

  async acceptTask(taskId, stakeAmount, senderAddress) {
    await ensureGenLayerNetwork();
    const client = this.getClient(senderAddress);
    const val = BigInt(stakeAmount);

    const hash = await client.writeContract({
      address: this.contractAddress,
      functionName: 'accept_task',
      args: [taskId],
      value: val,
    });

    await this.client.waitForTransactionReceipt({ hash });
    return this.getTaskById(taskId);
  }

  async submitDeliverable(taskId, subtitleUrl, senderAddress) {
    await ensureGenLayerNetwork();
    const client = this.getClient(senderAddress);

    const hash = await client.writeContract({
      address: this.contractAddress,
      functionName: 'submit_deliverable',
      args: [taskId, subtitleUrl],
    });

    await this.client.waitForTransactionReceipt({ hash });
    return this.getTaskById(taskId);
  }

  async finalizePayout(taskId, senderAddress) {
    await ensureGenLayerNetwork();
    const client = this.getClient(senderAddress);

    const hash = await client.writeContract({
      address: this.contractAddress,
      functionName: 'finalize_payout',
      args: [taskId],
    });

    await this.client.waitForTransactionReceipt({ hash });
    return this.getTaskById(taskId);
  }

  async resolveEscalation(taskId, action, senderAddress) {
    await ensureGenLayerNetwork();
    const client = this.getClient(senderAddress);

    const hash = await client.writeContract({
      address: this.contractAddress,
      functionName: 'resolve_escalation',
      args: [taskId, action],
    });

    await this.client.waitForTransactionReceipt({ hash });
    return this.getTaskById(taskId);
  }
}

export const contractService = new ContractService();
