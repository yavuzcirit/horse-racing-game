<script setup lang="ts">
import { GameControls } from '@/features/game'
</script>

<template>
  <header class="app-header">
    <div class="app-header__brand">
      <svg class="app-header__logo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path
          d="M9.5 8.5v8a6.5 6.5 0 0 0 13 0v-8"
          fill="none"
          stroke="currentColor"
          stroke-width="3.5"
          stroke-linecap="round"
        />
      </svg>
      <h1 class="app-header__title">Horse Racing</h1>
    </div>
    <GameControls />
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-height: var(--header-height);
  padding: var(--space-3) var(--space-5);
  background: linear-gradient(90deg, var(--color-brand-strong), var(--color-brand));
  color: #fff;
  box-shadow: var(--shadow-md);
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.app-header__logo {
  width: 28px;
  height: 28px;
}

.app-header__title {
  font-size: var(--text-xl);
  font-weight: 700;
  letter-spacing: 0.01em;
}

@media (max-width: 767px) {
  .app-header {
    position: static;
    padding: var(--space-3) var(--space-4);
  }

  .app-header :deep(.controls) {
    justify-content: flex-start;
  }
}
</style>
