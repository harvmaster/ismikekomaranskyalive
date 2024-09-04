// TODO: I think @monsterbitar (Jonathan) is working on something like this too.
//       So I haven't bothered making this complete. We'll just use his once it's done.
//       Or, if he's busy with other stuff, we can complete this and create an MR into Electrum-Cash.

import type { RequestResponse } from 'electrum-cash';

// TODO: This should be imported from electrum-cash library.
//       But it is not exported yet.
export type RPCParameter = string | number | boolean | null;

export interface ElectrumRequest {
  method: string;
  params: Array<RPCParameter>;
  response: RequestResponse;
}

export interface HeaderGetTip extends ElectrumRequest {
  method: 'blockchain.headers.get_tip';
  params: [];
  response: {
    height: number;
    hex: string;
  };
}

export interface AddressGetFirstUse extends ElectrumRequest {
  method: 'blockchain.address.get_first_use';
  params: [string];
  response: {
    height: number;
    hex: string;
  };
}

export interface AddressGetBalance extends ElectrumRequest {
  method: 'blockchain.address.get_balance';
  params: [string];
  response: {
    confirmed: number;
    unconfirmed: number;
  };
}

export interface AddressGetHistory extends ElectrumRequest {
  method: 'blockchain.address.get_history';
  // TODO: RPCParameter accepts a null type, but this should probably be changed to undefined instead.
  params: [string, number | null, number | null];
  response: Array<{
    height: number;
    tx_hash: string;
    fee?: number;
  }>;
}

export interface AddressGetMempool extends ElectrumRequest {
  method: 'blockchain.address.get_mempool';
  params: [string];
  response: Array<{
    height: number;
    tx_hash: string;
    fee?: number;
  }>;
}

export interface AddressGetScriptHash extends ElectrumRequest {
  method: 'blockchain.address.get_scripthash';
  params: [string];
  response: string;
}

export interface AddressListUnspent extends ElectrumRequest {
  method: 'blockchain.address.listunspent';
  params: [string, 'include_tokens' | 'exclude_tokens' | 'tokens_only'];
  response: Array<{
    height: number;
    token_data?: {
      amount: string;
      category: string;
      nft?: {
        capability: string;
        commitment: string;
      };
    };
    tx_hash: string;
    tx_pos: number;
    value: number;
  }>;
}

export interface AddressSubscribe extends ElectrumRequest {
  method: 'blockchain.address.subscribe';
  params: [string];
  // [Address, Status]
  response: [string, string | null];
}

export interface AddressUnsubscribe extends ElectrumRequest {
  method: 'blockchain.address.unsubscribe';
  params: [string];
  response: boolean;
}

export interface ScriptHashGetBalance extends ElectrumRequest {
  method: 'blockchain.scripthash.get_balance';
  params: [string];
  response: {
    confirmed: number;
    unconfirmed: number;
  };
}

export interface ScriptHashGetHistory extends ElectrumRequest {
  method: 'blockchain.scripthash.get_history';
  params: [string, number | null, number | null];
  response: Array<{
    height: number;
    tx_hash: string;
  }>;
}

export interface TransactionBroadcast extends ElectrumRequest {
  method: 'blockchain.transaction.broadcast';
  params: [string];
  response: string;
}

export interface TransactionGet extends ElectrumRequest {
  method: 'blockchain.transaction.get';
  params: [string, boolean];
  response: {
    blockhash: string;
    blocktime: number;
    confirmations: number;
    hash: string;
    hex: string;
    locktime: number;
    size: number;
    time: number;
    txid: string;
    version: number;
    vin: Array<{
      scriptSig: {
        asm: string;
        hex: string;
      };
      sequence: number;
      txid: string;
      vout: number;
    }>;
    vout: Array<{
      n: number;
      scriptPubKey: {
        asm: string;
        hex: string;
        type: string;
      };
      value: number;
    }>;
  };
}

export interface TransactionGetVerbose extends ElectrumRequest {
  method: 'blockchain.transaction.get';
  params: [string, true];
  response: {
    // TODO
  };
}

export interface TransactionSubscribe extends ElectrumRequest {
  method: 'blockchain.transaction.subscribe';
  params: [string];
  response: number | null;
}

export interface TransactionUnsubscribe extends ElectrumRequest {
  method: 'blockchain.transaction.unsubscribe';
  params: [string];
  response: boolean;
}

export interface AddressNotification {
  jsonrpc: '2.0';
  method: 'blockchain.address.subscribe';
  // [Address, Status]
  params: [string, string | null];
}
