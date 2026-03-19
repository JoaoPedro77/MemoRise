<script setup lang="ts">
// Animação cinematográfica de "acordar" para o upgrade Sonho Ruim
</script>

<template>
  <div class="fixed inset-0 z-1000 pointer-events-none overflow-hidden">
    <div class="absolute top-0 left-0 w-full h-[50vh] bg-neutral-950 eyelid-top shadow-[0_10px_50px_rgba(0,0,0,0.8)]" />
    <div class="absolute bottom-0 left-0 w-full h-[50vh] bg-neutral-950 eyelid-bottom shadow-[0_-10px_50px_rgba(0,0,0,0.8)]" />
    <!-- Efeito de desfoque inicial que some -->
    <div class="absolute inset-0 backdrop-blur-md blur-fade" />
  </div>
</template>

<style scoped>
.eyelid-top {
  animation: open-top 1.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
}
.eyelid-bottom {
  animation: open-bottom 1.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
}
.blur-fade {
  animation: fade-out 2s ease-out forwards;
}

@keyframes open-top {
  0% { transform: translateY(0); }
  20% { transform: translateY(0); } /* Pequena pausa preta */
  100% { transform: translateY(-100%); }
}

@keyframes open-bottom {
  0% { transform: translateY(0); }
  20% { transform: translateY(0); } /* Pequena pausa preta */
  100% { transform: translateY(100%); }
}

@keyframes fade-out {
  0% { opacity: 1; }
  40% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
