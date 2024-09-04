// Import configurations.
import { ELECTRUM_SERVERS } from 'src/config.js';

// Import services the app may require.
import { ElectrumService } from './electrum.js';

// import { generateBip39Mnemonic } from '@bitauth/libauth';

// Vue and Quasar.
import { ref } from 'vue';
import TransactionMonitor from './transaction-monitor.js';

const ADDRESS = 'qqyy3mss5vmthgnu0m5sm39pcfq8z799ku2nxernca';

export class App {
  // Services.
  electrum: ElectrumService;
  transactionMonitor: TransactionMonitor;

  // Flags.
  debug = ref(false);

  //---------------------------------------------------------------------------
  // Initialization
  //---------------------------------------------------------------------------

  constructor() {
    // Setup our Electrum Service.
    this.electrum = new ElectrumService(ELECTRUM_SERVERS);
    this.transactionMonitor = new TransactionMonitor(this.electrum, ADDRESS);
  }

  async start(): Promise<void> {
    // Start the following services in parallel as they have no dependency on each other.
    await Promise.all([
      // Electrum Service
      this.electrum.start(),
    ]);
  }
}
