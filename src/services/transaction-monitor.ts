import { ElectrumService } from './electrum';
import type {
  AddressGetMempool,
  AddressListUnspent,
  TransactionGet,
} from 'src/services/electrum-types.js';

class TransactionMonitor {
  public address: string;

  constructor(private readonly electrum: ElectrumService, address: string) {
    this.address = address;
  }

  async getLatestTransaction() {
    // Check whether there is a transaction in the mempool
    let transaction = await this.getLatestMempoolTransaction();

    // If there is no transaction in the mempool, we'll check the unspent transactions
    if (!transaction) {
      transaction = await this.getLatestUnspentTransaction();
    }

    // If there is still no transaction, we return undefined
    if (!transaction) {
      return undefined;
    }

    // return transaction
    return transaction;
  }

  async getUnspentTransactions() {
    // Fetch latest transactions from the address using electurm
    const unspent = await this.electrum.request<AddressListUnspent>(
      'blockchain.address.listunspent',
      this.address,
      'exclude_tokens'
    );

    return unspent;
  }

  async getLatestUnspentTransaction() {
    // Get the list of unspent transactions
    const unspentTransactions = await this.getUnspentTransactions();

    // Get the latest transaction using the filter
    const latestTransaction =
      this.filterLatestUnspentTransaction(unspentTransactions);

    return latestTransaction;
  }

  async filterLatestUnspentTransaction(
    transactions: AddressListUnspent['response'] | AddressGetMempool['response']
  ) {
    // Find the highest block. If the block is equal to 0, it is in the mempool, so we want to use that
    const highestBlock = transactions.reduce((highest: number, tx) => {
      if ((tx.height = 0)) return (highest = 0);
      highest = tx.height > highest ? tx.height : highest;
      return highest;
    }, 0);

    // Remove the transactions that arent in the highest block
    const validTransactions = transactions.filter(
      (tx) => tx.height === highestBlock
    );

    // If there are no transactions, return undefined
    if (!validTransactions.length) return undefined;

    // Fetch the address' transactions that are in the highest block
    const transactionPromises = validTransactions.map((tx) =>
      this.electrum.request<TransactionGet>(
        'blockchain.transaction.get',
        tx.tx_hash,
        true
      )
    );

    // Wait for all of the responses
    const transactionsRes = await Promise.all(transactionPromises);
    console.log(transactionsRes);

    // Get the one with the highest timestamp
    const latestTransaction = transactionsRes.reduce((latest, tx) => {
      const { timestamp } = this.readTransactionOpReturn(tx) || {
        timestamp: 0,
      };
      const { timestamp: latestTimestamp } = this.readTransactionOpReturn(
        tx
      ) || { timestamp: 0 };

      latest = timestamp > latestTimestamp ? tx : latest;

      return latest;
    });

    // Return latest transaction
    return latestTransaction;
  }

  // Fetch the address' transactions from the mempool using electrum
  async getMempoolTransactions() {
    const mempool = await this.electrum.request<AddressGetMempool>(
      'blockchain.address.get_mempool',
      this.address
    );

    return mempool;
  }

  // Fetch the address' transactions from the mempool and get the latest one
  async getLatestMempoolTransaction() {
    // Get transactions from the mempool
    const mempoolTransactions = await this.getMempoolTransactions();

    // Filter the transactions and get the latest transaction
    const latestTransaction = await this.filterLatestUnspentTransaction(
      mempoolTransactions
    );

    // Return latest transaction
    return latestTransaction;
  }

  // Find output that is an OP_RETURN
  getOpReturnOutput(transaction: TransactionGet['response']) {
    return transaction.vout.find((output) =>
      output.scriptPubKey.asm.includes('OP_RETURN')
    );
  }

  // Convert hex to UTF-8 and return timestamp and heart rate
  decodeOpReturn(data: string) {
    // Decode hex to UTF-8
    const decodedData = decodeURIComponent(
      data.replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&')
    );

    // Read values from OP_RETURN
    const [timestampStr, heartRateStr] = decodedData
      .split('OP_RETURN')[0]
      .split('\n')[1]
      .split('');

    // Convert timestamp from string to number
    const timestamp = Number(timestampStr);

    // Convert heartRate from string to number
    const heartRate = Number(heartRateStr);

    // return timestamp and heart rate
    return {
      timestamp,
      heartRate,
    };
  }

  readTransactionOpReturn(transaction: TransactionGet['response']) {
    // Get the OP_RETURN output
    const opReturnOutput = this.getOpReturnOutput(transaction);
    if (!opReturnOutput) return;

    // Decode OP_RETURN
    const opReturnData = this.decodeOpReturn(opReturnOutput.scriptPubKey.hex);

    return opReturnData;
  }
}

export default TransactionMonitor;
