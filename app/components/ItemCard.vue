<script setup lang="ts">
import type { Upgrade } from '~/constants/upgrades'

const props = defineProps<{
  item: Upgrade & { instanceId: string }
  index: number
  selected: boolean
}>()

const emit = defineEmits(['click', 'activate'])

const alvo = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const hasMovedSignificant = ref(false)
const startY = ref(0)
const currentY = ref(0)
const dragThreshold = -60 // Quanto precisa arrastar a mais pra cima pra ativar
const gameStore = useGameStore()

const dragOffset = computed(() => {
  if (!isDragging.value) return 0
  return currentY.value - startY.value
})

const handlePointerDown = (e: PointerEvent) => {
  if (gameStore.isTurnInProgress && !props.selected) {
    gameStore.showToast('Termine sua jogada antes de usar um item!')
    return
  }
  isDragging.value = true
  hasMovedSignificant.value = false
  startY.value = e.clientY
  currentY.value = e.clientY
  alvo.value?.setPointerCapture(e.pointerId)
}

const handlePointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return
  currentY.value = e.clientY
  if (Math.abs(currentY.value - startY.value) > 10) {
    hasMovedSignificant.value = true
  }
}

const handlePointerUp = (e: PointerEvent) => {
  if (!isDragging.value) return

  const baseLift = props.selected ? -60 : 0
  const totalLift = baseLift + dragOffset.value

  if (!hasMovedSignificant.value) {
    emit('click')
  } else if (totalLift <= (baseLift + dragThreshold)) {
    emit('activate')
  }

  isDragging.value = false
  alvo.value?.releasePointerCapture(e.pointerId)
}

const { elementX, elementY, isOutside, elementHeight, elementWidth } = useMouseInElement(alvo)

const cardTransform = computed(() => {
  const MAX_ROTATION = 15
  const tiltX = (
    MAX_ROTATION / 2 - (elementY.value / elementHeight.value) * MAX_ROTATION
  ).toFixed(2)

  const tiltY = (
    (elementX.value / elementWidth.value) * MAX_ROTATION - MAX_ROTATION / 2
  ).toFixed(2)

  const tilt = isOutside.value || isDragging.value ? '' : `perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`

  const baseLift = props.selected ? -60 : 0
  let liftValue = baseLift
  if (isDragging.value) {
    liftValue = baseLift + dragOffset.value
  }
  let scale = props.selected ? 1.1 : 1
  if (isReadyToActivate.value) {
    scale = 1.3
  }

  return `translateY(${liftValue}px) scale(${scale}) ${tilt}`.trim()
})

const isReadyToActivate = computed(() => {
  if (!isDragging.value) return false
  const baseLift = props.selected ? -60 : 0
  return (baseLift + dragOffset.value) <= (baseLift + dragThreshold)
})
</script>

<template>
  <div
    ref="alvo"
    class="relative w-[80px] h-[110px] sm:w-[100px] sm:h-[135px] cursor-pointer transition-all duration-300 ease-out z-10"
    :class="{
      'z-50': selected,
      'duration-0': isDragging
    }"
    style="perspective: 1000px; touch-action: none;"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @click.stop
  >
    <div
      class="w-full h-full duration-200 relative"
      :style="{ transform: cardTransform }"
    >
      <!-- Fundo da Carta -->
      <NuxtImg
        src="carta5.png"
        class="w-full h-full object-contain drop-shadow-xl transition-all"
        :class="{
          'brightness-125 saturate-110': selected || isDragging,
          'brightness-150 saturate-150': isReadyToActivate,
          'saturate-[0.4]': gameStore.isTurnInProgress && !selected
        }"
      />

      <!-- Conteúdo (Invertido: Nome em cima, Logo embaixo) -->
      <div class="absolute inset-0 flex flex-col items-center justify-center p-2 gap-1 text-center select-none">
        <h3 class="text-[9px] sm:text-[10px] font-black text-neutral-900/80 leading-tight uppercase px-1">
          {{ item.name }}
        </h3>
        <UIcon
          :name="item.icon"
          class="text-2xl sm:text-3xl text-pink-800 drop-shadow-sm"
        />
      </div>
    </div>
  </div>
</template>
