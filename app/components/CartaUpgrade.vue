<script setup lang="ts">
import type { Upgrade } from '~/constants/upgrades'

const props = defineProps<{
  upgrade: Upgrade
  index: number
}>()
defineEmits(['click'])

const alvo = ref(null)
const { elementX, elementY, isOutside, elementHeight, elementWidth } = useMouseInElement(alvo)

const cardTransform = computed(() => {
  const MAX_ROTATION = 20
  const rX = (
    MAX_ROTATION / 2 - (elementY.value / elementHeight.value) * MAX_ROTATION
  ).toFixed(2)

  const rY = (
    (elementX.value / elementWidth.value) * MAX_ROTATION - MAX_ROTATION / 2
  ).toFixed(2)

  return isOutside.value ? 'none' : `perspective(${elementHeight.value}px) rotateX(${rX}deg) rotateY(${rY}deg)`
})

const typeLabel = computed(() => {
  switch (props.upgrade.type) {
    case 'perk': return 'Passiva'
    case 'item': return 'Item'
    case 'curse': return 'Maldição'
    default: return props.upgrade.type
  }
})
const typecard = computed(() => {
  switch (props.upgrade.type) {
    case 'perk': return 'carta3.png'
    case 'item': return 'carta5.png'
    case 'curse': return 'carta4.png'
    default: return 'carta3.png'
  }
})

const typecolor = computed(() => {
  switch (props.upgrade.type) {
    case 'perk': return 'text-secondary-600'
    case 'item': return 'text-pink-700'
    case 'curse': return 'text-gray-600'
    default: return 'text-secondary-600'
  }
})
</script>

<template>
  <div
    ref="alvo"
    class="relative w-[140px] sm:w-[180px] cursor-pointer anim-entrada"
    style="perspective: 1000px"
    :style="{ '--delay': `${index * 0.1}s` }"
    @click="$emit('click')"
  >
    <div
      class="w-full h-full duration-200 relative"
      :style="{ transform: cardTransform }"
    >
      <!-- Fundo Original (Sem cortes) -->
      <NuxtImg
        :src="typecard"
        class="w-full h-full object-contain drop-shadow-2xl"
      />

      <!-- Conteúdo por cima da arte -->
      <div class="absolute inset-0 flex flex-col items-center justify-baseline p-2 pt-3 gap-4 sm:pt-3.5 text-center select-none">
        <h3 class="text-sm sm:text-lg font-black text-neutral-900/80 leading-tight uppercase">
          {{ upgrade.name }}
        </h3>
        <UIcon
          :name="upgrade.icon"
          class="mt-1 text-5xl sm:text-7xl mb-1 sm:mb-2 drop-shadow-md"
          :class="typecolor"
        />

        <div class="space-y-1 px-1">
          <p class="text-xs sm:text- pb-1 sm:pb-2 text-neutral-900/80 line-clamp-3 leading-tight font-bold italic">
            {{ upgrade.description }}
          </p>
        </div>

        <!-- Badge de Tipo discreto -->
        <div
          class="absolute top-7 sm:top-9.5 right-5 text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-neutral-900/80"
        >
          {{ typeLabel }}
        </div>
        <div
          v-if="upgrade.type !== 'item'"
          class="absolute top-7 sm:top-9.5 left-5 text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-neutral-900/80"
        >
          {{ upgrade.floors }} andares
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anim-entrada {
  opacity: 0;
  animation: entrar 0.5s ease-out forwards;
  animation-delay: var(--delay);
}

@keyframes entrar {
  from {
    opacity: 0;
    transform: translateY(-50px) rotate(5deg) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(0) scale(1);
  }
}
</style>
