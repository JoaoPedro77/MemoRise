import { ref, onUnmounted } from 'vue'

export function useTimer() {
  const timeRemaining = ref(-1)
  const isPlaying = ref(false)
  const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)

  function stop() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
    isPlaying.value = false
  }

  function start(initialTime: number, onComplete?: () => void) {
    stop()
    if (initialTime <= 0) {
      timeRemaining.value = -1
      return
    }

    timeRemaining.value = initialTime
    isPlaying.value = true

    timerInterval.value = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
        if (timeRemaining.value <= 0) {
          stop()
          if (onComplete) onComplete()
        }
      }
    }, 1000)
  }

  function reset(newTime: number) {
    timeRemaining.value = newTime
  }

  // Garante a limpeza do timer quando o componente/hook for destruído
  onUnmounted(() => {
    stop()
  })

  return {
    timeRemaining,
    isPlaying,
    start,
    stop,
    reset
  }
}
