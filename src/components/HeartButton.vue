<template>
  <div class="heart-button" :class="{ show: visible }" @click="toggleVisible">
    <div class="content-wrapper">
      <transition name="slide-fade">
        <span v-if="visible" class="heart-rate">{{ props.heartRate }}</span>
      </transition>
    </div>
    <q-btn
      flat
      round
      dense
      icon="favorite"
      :color="heartColour"
      class="heart-icon"
      :class="heartClasses"
    />
  </div>
</template>

<style scoped>
:root {
  --heart-rate: 1s;
}

.heart-button {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  transition: all 0.3s ease;
  opacity: 0.075;
  padding: 4px;
  border-radius: 20px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  overflow: hidden;
}

.heart-button:hover,
.heart-button.show {
  opacity: 1;
}

.heart-button.show {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 15px;
  padding: 4px 8px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.25);
  width: auto;
  height: auto;
  min-width: 100px;
  max-width: 80%;
}

.content-wrapper {
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
}

.heart-icon {
  transition: color 0.3s ease;
  min-width: 32px;
  min-height: 32px;
  flex-shrink: 0;
}

.heart-beat {
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

.heart-rate {
  font-weight: bold;
  margin-right: 1em;
  white-space: nowrap;
  color: white;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';

interface HeartProps {
  heartRate: number;
  isAlive: boolean;
}
const props = defineProps<HeartProps>();

const visible = ref(false);

const toggleVisible = () => {
  visible.value = !visible.value;
};

const heartColour = computed(() => {
  if (props.isAlive && visible.value) return 'red-4';
  return 'grey-3';
});

const heartClasses = computed(() => {
  if (props.isAlive && visible.value) return { 'heart-beat': true };

  return {};
});

watch(
  () => props.heartRate,
  () => {
    setHeartBeat(props.heartRate);
  }
);
const setHeartBeat = (bpm: number) => {
  // Set the timer for the heart icon to beat in-sync with the BPM
  const beatTime = 60 / bpm;
  document.documentElement.style.setProperty('--heart-rate', `${beatTime}s`);
};

defineExpose({
  toggleVisible,
});
</script>
