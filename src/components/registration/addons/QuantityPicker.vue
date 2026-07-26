<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  max: {
    type: Number,
    required: true,
    validator: (max) => Number.isInteger(max) && max >= 0,
  },
  itemName: {
    type: String,
    required: true,
  },
})

const quantity = defineModel({
  type: Number,
  required: true,
  validator: (value) => Number.isInteger(value) && value >= 0,
})

const decreaseButtonRef = ref(null)
const increaseButtonRef = ref(null)

const canDecrease = computed(() => quantity.value > 0)
const canIncrease = computed(() => (
  Number.isInteger(props.max) && quantity.value < props.max
))

function decrease() {
  if (canDecrease.value) {
    quantity.value -= 1
  }
}

function increase() {
  if (canIncrease.value) {
    quantity.value += 1
  }
}

function focus() {
  const target = canIncrease.value
    ? increaseButtonRef.value?.$el
    : decreaseButtonRef.value?.$el

  if (target instanceof HTMLElement) {
    target.focus()
    return true
  }

  return false
}

defineExpose({
  focus,
})
</script>

<template>
  <div
    class="quantity-picker"
    role="group"
    :aria-label="`${itemName} quantity`"
  >
    <span class="quantity-picker__label">Qty:</span>

    <q-btn
      ref="decreaseButtonRef"
      class="quantity-picker__button"
      flat
      dense
      round
      icon="remove"
      :disable="!canDecrease"
      :aria-label="`Decrease ${itemName} quantity`"
      @click="decrease"
    />

    <output
      class="quantity-picker__value"
      aria-live="polite"
    >
      {{ quantity }}
    </output>

    <q-btn
      ref="increaseButtonRef"
      class="quantity-picker__button"
      flat
      dense
      round
      icon="add"
      :disable="!canIncrease"
      :aria-label="`Increase ${itemName} quantity`"
      @click="increase"
    />

    <span class="quantity-picker__max">max {{ max }}</span>
  </div>
</template>

<style scoped>
.quantity-picker {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--space-sm);
}

.quantity-picker__label {
  color: var(--text-neutral-muted);
  font-size: var(--font-size-sm);
  font-weight: 570;
  line-height: var(--line-height-sm);
}

.quantity-picker__button {
  width: 28px;
  min-width: 28px;
  height: 28px;
  min-height: 28px;
  background: var(--bg-surface-l2);
  color: var(--text-neutral-default);
  font-size: 16px;
}

.quantity-picker__button:focus-visible {
  outline: var(--focus-ring-width) solid var(--border-brand-emphasis);
  outline-offset: var(--focus-ring-offset);
}

.quantity-picker__value {
  width: 24px;
  color: var(--text-neutral-default);
  font-size: 14px;
  font-weight: 610;
  line-height: 28px;
  text-align: center;
}

.quantity-picker__max {
  color: var(--text-neutral-quiet);
  font-size: 10px;
  line-height: 12px;
  white-space: nowrap;
}
</style>
