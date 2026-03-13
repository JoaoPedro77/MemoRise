<script setup lang="ts">
import type { Card } from '~/utils/game-logic'

// Recebe a carta como propriedade
defineProps<{ card: Card }>()
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
</script>

<template>
  <div
    ref="alvo"
    class="relative w-[70px] h-[90px] cursor-pointer"
    style="perspective: 1000px"
    @click="$emit('click')"
  >
    <!-- Container que faz o TILT (Efeito do mouse) -->
    <div
      class="w-full h-full duration-200"
      :style="{ transform: cardTransform }"
    >
      <!-- Container que faz o FLIP (Gira a carta) -->
      <div
        class="w-full h-full duration-500 transition-transform relative"
        style="transform-style: preserve-3d"
        :class="{ 'transform-[rotateY(180deg)]': card.revelada || card.combinada }"
      >
        <!-- VERSO (Carta virada para baixo) -->
        <div
          class="absolute inset-0 w-full h-full backface-hidden z-10"
        >
          <NuxtImg
            src="cartaCosta.png"
            class="w-full h-full shadow-lg rounded-sm"
          />
        </div>

        <!-- FRENTE (O emoji) -->
        <div
          class="absolute inset-0 w-full h-full backface-hidden transform-[rotateY(180deg)] z-20"
        >
          <NuxtImg
            src="cartaFrente.png"
            class="w-full h-full shadow-lg rounded-sm"
          />
          <span class="absolute pt-2 font-emoji text-shadow-sm inset-0 flex items-center justify-center text-3xl pb-2 select-none">
            {{ card.valor }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
