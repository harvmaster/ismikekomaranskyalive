<template>
  <q-page class="flex items-center justify-center">
    <!-- Display loading icon until requests complete -->
    <q-spinner v-if="loading" />

    <!-- Display 'yes' or 'maybe' for whether he is alive -->
    <div v-else class="glass-panel">
      <!-- Yes or maybe -->
      <p class="title">
        {{ isAlive ? 'Yes' : 'Maybe' }}
      </p>

      <!-- Heart Rate information -->
      <div class="row justify-center">
        <q-icon class="heart-icon" name="favorite" color="red-5" size="2em" />
        <p class="subtitle heart-rate">
          {{ heartRate }}
        </p>
      </div>

      <!-- View address information on blockchair -->
      <div class="">
        <a
          class="text-green-4 text-weight-bold"
          target="_blank"
          href="https://blockchair.com/bitcoin-cash/address/qqyy3mss5vmthgnu0m5sm39pcfq8z799ku2nxernca"
          >View with Blockchair</a
        >
      </div>
    </div>
  </q-page>
</template>

<style>
:root {
  --heart-rate: 1s;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #f0f0f0;
}

.subtitle {
  font-size: 1.2rem;
  font-weight: 300;
  color: #d0d0d0;
}

.heart-icon {
  animation: beat infinite;
  animation-duration: var(--heart-rate);
}

@keyframes rotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes beat {
  0% {
    transform: scale(100%);
  }
  10% {
    transform: scale(110%);
  }
  20% {
    transform: scale(100%);
  }
  100% {
    transform: scale(100%);
  }
}
/*
@media (max-width: 768px) {
  .glass-panel {
    padding: 20px;
  }
  .title {
    font-size: 2rem;
  }
  .subtitle {
    font-size: 1rem;
  }
} */
</style>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { App } from 'src/services/app.js';
import { TransactionGet } from 'src/services/electrum-types';

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
  if (!latestTransactionData.value) return false;

  // Get timestamp data from OP_RETURN
  const { heartRate } = latestTransactionData.value;

  // Set the timer for the heart icon to beat in-sync with the BPM
  const beatTime = getHeartRateTime(heartRate);
  document.documentElement.style.setProperty('--heart-rate', `${beatTime}s`);

  return heartRate || 0;
});

// Get the length between each beat in seconds
const getHeartRateTime = (heartRate: number) => {
  return 60 / heartRate;
};

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
