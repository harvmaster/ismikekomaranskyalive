<template>
  <q-page class="flex items-center justify-center">
    <!-- Display loading icon until requests complete -->
    <q-spinner v-if="loading" />

    <!-- Display 'yes' or 'maybe' for whether he is alive -->
    <div v-else class="glass-panel">
      <!-- Yes or maybe -->
      <a
        class="title no-text-decoration"
        target="_blank"
        href="https://blockchair.com/bitcoin-cash/address/qqyy3mss5vmthgnu0m5sm39pcfq8z799ku2nxernca"
      >
        {{ isAlive ? 'yes' : 'maybe' }}
      </a>
    </div>

    <!-- Heart Button in bottom right -->
    <div class="fixed-bottom-right q-pa-md">
      <HeartButtonVue :isAlive="isAlive" :heartRate="heartRate" />
    </div>
  </q-page>
</template>

<style>
.title {
  font-size: 3rem;
  /* font-weight: 700; */
  margin-bottom: 1rem;
  color: #f0f0f0;
}

.subtitle {
  font-size: 1.2rem;
  font-weight: 300;
  color: #d0d0d0;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { App } from 'src/services/app.js';
import { TransactionGet } from 'src/services/electrum-types';

import HeartButtonVue from 'src/components/HeartButton.vue';

const loading = ref(true);
const latestTransaction = ref<TransactionGet['response']>();

const app = new App();

await app.start();

const latestTransactionData = computed(() => {
  if (!latestTransaction.value) return undefined;

  // Read the transactions OP_RETURN data as timestamp and heartRate
  const opReturnData = app.transactionMonitor.readTransactionOpReturn(
    latestTransaction.value
  );

  return opReturnData;
});

// If there is a transaction and its less than 10 minutes old, we return true. Else false
const isAlive = computed<boolean>(() => {
  // If we can't read the OP_RETURN data, something probably went wrong
  if (!latestTransactionData.value) return false;

  // Get timestamp data from OP_RETURN
  const { timestamp } = latestTransactionData.value;

  // If the timestamp is more than 10 minutes old, he may not be alive
  if (timestamp * 1000 < Date.now() - 60 * 10 * 1000) return false;

  return true;
});

const heartRate = computed(() => {
  // If we can't read the OP_RETURN data, something probably went wrong
  if (!latestTransactionData.value) return 0;

  // Get timestamp data from OP_RETURN
  const { heartRate } = latestTransactionData.value;

  return heartRate || 0;
});

// Get the latest transaction and set latestTransaction above
const getLatestTransaction = async () => {
  // Fetch the latest transaction from mempool, and if there is none there, try to find it from the unspents
  const latest = await app.transactionMonitor.getLatestTransaction();

  // Stop loading
  if (loading.value) loading.value = false;

  console.log(latest);

  // If there is no latest, don't set latestTransaction
  if (!latest) return;

  // Update latestTransaction
  latestTransaction.value = latest;
};

// Poll the transactions every 30 seconds
setInterval(() => {
  getLatestTransaction();
}, 30 * 1000);

// Get the latest transaction on startup
getLatestTransaction();
</script>
