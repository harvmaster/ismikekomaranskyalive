<template>
  <q-page class="glassmorphism-page">
    <!-- <div class="color-burst" /> -->

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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;700&display=swap');
:root {
  --heart-rate: 1s;
}

.glassmorphism-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
}

.color-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200vmax;
  height: 200vmax;
  transform: translate(-50%, -50%);
  background: conic-gradient(
    from 0deg,
    rgba(255, 45, 85, 0.2),
    rgba(255, 149, 0, 0.2),
    rgba(255, 204, 0, 0.2),
    rgba(52, 199, 89, 0.2),
    rgba(90, 200, 250, 0.2),
    rgba(0, 122, 255, 0.2),
    rgba(88, 86, 214, 0.2),
    rgba(175, 82, 222, 0.2)
  );
  opacity: 0.4;
  filter: blur(40px);
  animation: rotate 30s linear infinite;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  text-align: center;
  max-width: 80%;
}

.title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #333;
}

.subtitle {
  font-size: 1.2rem;
  font-weight: 300;
  color: #666;
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

@media (max-width: 768px) {
  .glass-panel {
    padding: 30px;
  }
  .title {
    font-size: 2.5rem;
  }
  .subtitle {
    font-size: 1rem;
  }
}
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
