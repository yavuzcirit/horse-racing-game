<script setup lang="ts">
import type { ButtonVariant } from './types'

const { variant = 'secondary', type = 'button' } = defineProps<{
  variant?: ButtonVariant
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>()
</script>

<template>
  <button :type="type" class="button" :class="`button--${variant}`" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 40px;
  padding: 0 var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    color 120ms ease;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.button--primary {
  background: var(--color-surface);
  color: var(--color-brand-strong);
}

.button--primary:not(:disabled):hover {
  background: var(--color-brand-soft);
}

.button--secondary {
  background: rgb(255 255 255 / 0.12);
  border-color: rgb(255 255 255 / 0.65);
  color: #fff;
}

.button--secondary:not(:disabled):hover {
  background: rgb(255 255 255 / 0.22);
}

.button--ghost {
  min-height: 32px;
  padding: 0 var(--space-3);
  background: transparent;
  border-color: var(--color-border-strong);
  color: var(--color-text);
}

.button--ghost:not(:disabled):hover {
  background: var(--color-surface-muted);
}
</style>
