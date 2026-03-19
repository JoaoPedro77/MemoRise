<script setup lang="ts">
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
const toast = useToast()

async function handleStartNew() {
  gameStore.startNewGame()
  await navigateTo('/game')
}

const isHowToPlayOpen = ref(false)

function showConstructionToast() {
  toast.add({
    title: 'Modo Battles',
    description: 'Este modo está em construção e chegará em breve! ⚔️',
    icon: 'i-lucide-construction',
    color: 'warning'
  })
}
</script>

<template>
  <div class="fixed inset-0 z-100 flex flex-col items-center justify-center bg-neutral-950 overflow-hidden">
    <!-- Background Decorativo -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-900/20 blur-[120px] rounded-full" />
      <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary-900/20 blur-[120px] rounded-full" />
    </div>

    <div class="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center space-y-12 animate-in fade-in zoom-in duration-700">
      <!-- Logo Principal -->
      <div class="relative group">
        <div class="absolute inset-0 bg-primary-500/20 blur-2xl group-hover:bg-primary-500/40 transition-all duration-500 rounded-full scale-110" />
        <NuxtImg
          src="/logo.png"
          alt="MemoRise Logo"
          class="relative w-64 md:w-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform duration-500 hover:scale-105"
        />
      </div>

      <!-- Título e Subtítulo -->
      <div class="space-y-4">
        <p
          v-if="gameStore.bestFloor > 0"
          class="text-primary-500 font-black text-xs uppercase tracking-widest animate-pulse"
        >
          Recorde: Andar {{ gameStore.bestFloor }}
        </p>
        <p class="text-neutral-400 font-medium text-sm md:text-base leading-relaxed max-w-[280px] mx-auto">
          Suba os andares e colete relíquias em uma jornada testando sua memória.
        </p>
      </div>

      <!-- Ações -->
      <div class="flex flex-col gap-4 w-full">
        <UButton
          icon="game-icons:stone-tower"
          label="Subir a torre"
          size="xl"
          color="primary"
          variant="solid"
          block
          class="font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(var(--primary-500),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-500),0.5)] transition-all"
          @click="handleStartNew()"
        />

        <UButton
          icon="game-icons:bookmark"
          label="Como Jogar"
          size="xl"
          color="neutral"
          variant="subtle"
          block
          class="font-bold py-4 rounded-xl transition-all"
          @click="isHowToPlayOpen = true"
        />

        <UButton
          icon="game-icons:crossed-swords"
          label="Modo Battles"
          size="xl"
          color="secondary"
          variant="subtle"
          block
          class="font-bold py-4 rounded-xl transition-all"
          @click="showConstructionToast()"
        />
      </div>

      <!-- Modal Como Jogar -->
      <UModal v-model:open="isHowToPlayOpen">
        <template #content>
          <div class="p-4 space-y-5 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div class="text-center space-y-2">
              <h2 class="text-3xl font-black italic text-primary-500 uppercase tracking-tighter">
                Como Jogar
              </h2>
              <div class="h-1 w-12 bg-primary-500 mx-auto rounded-full" />
            </div>

            <div class="space-y-3 text-left">
              <!-- Objetivo -->
              <section class="flex gap-4 items-start bg-white/5 p-3 rounded-xl border border-white/5">
                <UIcon
                  name="game-icons:treasure-map"
                  class="text-3xl text-primary-400 shrink-0"
                />
                <div>
                  <h4 class="font-bold text-white uppercase text-xs tracking-widest mb-1">
                    Objetivo
                  </h4>
                  <p class="text-sm text-neutral-400">
                    Encontre os pares de cartas para limpar o tabuleiro. Cada andar concluído te leva mais alto na torre!
                  </p>
                </div>
              </section>

              <!-- Vida e Punições -->
              <section class="flex gap-4 items-start bg-white/5 p-3 rounded-xl border border-white/5">
                <UIcon
                  name="game-icons:glass-heart"
                  class="text-3xl text-rose-500 shrink-0"
                />
                <div>
                  <h4 class="font-bold text-white uppercase text-xs tracking-widest mb-1">
                    Vidas e Memória
                  </h4>
                  <p class="text-sm text-neutral-400">
                    Você começa com 3 vidas. Errar um par que você já revelou antes custa uma vida. Fique atento!
                  </p>
                </div>
              </section>

              <!-- O Tempo -->
              <section class="flex gap-4 items-start bg-white/5 p-3 rounded-xl border border-white/5">
                <UIcon
                  name="game-icons:sands-of-time"
                  class="text-3xl text-amber-500 shrink-0"
                />
                <div>
                  <h4 class="font-bold text-white uppercase text-xs tracking-widest mb-1">
                    O Tempo Corre
                  </h4>
                  <p class="text-sm text-neutral-400">
                    A partir do 2º andar, o tempo começa a esgotar. Se o relógio chegar a zero, sua jornada termina.
                  </p>
                </div>
              </section>

              <!-- Relíquias -->
              <section class="flex gap-4 items-start bg-white/5 p-3 rounded-xl border border-white/5">
                <UIcon
                  name="game-icons:skills"
                  class="text-3xl text-emerald-500 shrink-0"
                />
                <div>
                  <h4 class="font-bold text-white uppercase text-xs tracking-widest mb-1">
                    Itens e Upgrades
                  </h4>
                  <p class="text-sm text-neutral-400">
                    Escolha sabiamente a cada 2 andares. Você pode carregar até 5 itens. Use-os clicando duas vezes ou arrastando a carta para cima.
                  </p>
                </div>
              </section>
            </div>

            <UButton
              label="Entendido!"
              color="primary"
              size="xl"
              block
              class="font-bold rounded-xl"
              @click="isHowToPlayOpen = false"
            />
          </div>
        </template>
      </UModal>

      <!-- Footer / Versão -->
      <div class="pt-8 opacity-30 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-neutral-500">
        <UIcon name="game-icons:shield" />
        v1.2.0
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.fade-in { animation: fade-in 1s ease-out; }
.zoom-in { animation: zoom-in 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
</style>
