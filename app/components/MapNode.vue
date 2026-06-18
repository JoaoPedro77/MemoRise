<script setup lang="ts">
import type { MapNode } from '~/utils/map-generator'
import { NodeState } from '~/utils/map-generator'

const props = defineProps<{
  node: MapNode
  isOnPath: boolean
}>()

const emit = defineEmits<{
  select: [nodeId: string]
}>()

const iconClass = computed(() => {
  if (props.node.state === NodeState.AVAILABLE) {
    return 'text-primary-400 cursor-pointer hover:scale-125 hover:text-primary-300 transition-transform'
  }
  if (props.node.state === NodeState.VISITED) {
    return props.isOnPath ? 'text-primary-300 cursor-default' : 'text-neutral-600 cursor-default'
  }
  return 'opacity-20 cursor-default'
})

const tooltipText = computed(() => {
  return `${props.node.label} — Clique para entrar`
})

function handleClick() {
  if (props.node.state === NodeState.AVAILABLE) {
    emit('select', props.node.id)
  }
}
</script>

<template>
  <UTooltip :text="tooltipText">
    <div
      class="transition-all duration-200"
      :class="iconClass"
      @click="handleClick"
    >
      <UIcon
        :name="node.icon"
        class="text-3xl sm:text-4xl"
      />
    </div>
  </UTooltip>
</template>
