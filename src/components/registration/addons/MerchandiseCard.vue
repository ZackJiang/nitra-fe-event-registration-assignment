<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatUsd, toCents } from '../../../utils/registrationPricing.js'
import QuantityPicker from './QuantityPicker.vue'

const props = defineProps({
  addon: {
    type: Object,
    required: true,
  },
  selection: {
    type: Object,
    required: true,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  errorMessageId: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits({
  'set-quantity': (addonId, quantity) => (
    typeof addonId === 'string' && Number.isInteger(quantity)
  ),
  'set-size': (addonId, size) => (
    typeof addonId === 'string' && (typeof size === 'string' || size === null)
  ),
})

const quantityPickerRef = ref(null)
const sizeSelectRef = ref(null)
const { locale, t } = useI18n()

const isSelected = computed(() => props.selection.quantity > 0)
const hasSizes = computed(() => (
  Array.isArray(props.addon.sizes) && props.addon.sizes.length > 0
))
const priceLabel = computed(() => formatUsd(toCents(props.addon.price), locale.value))
const quantityModel = computed({
  get: () => props.selection.quantity,
  set: (quantity) => emit('set-quantity', props.addon.id, quantity),
})
const sizeModel = computed({
  get: () => props.selection.size,
  set: (size) => emit('set-size', props.addon.id, size),
})

function focus() {
  if (props.hasError && hasSizes.value && isSelected.value) {
    if (typeof sizeSelectRef.value?.focus === 'function') {
      sizeSelectRef.value.focus()
      return true
    }

    return false
  }

  return quantityPickerRef.value?.focus() ?? false
}

defineExpose({
  focus,
})
</script>

<template>
  <q-card
    class="merchandise-card"
    :class="{
      'merchandise-card--selected': isSelected,
      'merchandise-card--error': hasError,
    }"
    :data-addon-id="addon.id"
  >
    <div class="merchandise-card__header">
      <h2 class="merchandise-card__title">
        {{ addon.name }}
      </h2>
      <span class="merchandise-card__price">{{ priceLabel }}</span>
    </div>

    <p class="merchandise-card__description">
      {{ addon.description }}
    </p>

    <div class="merchandise-card__controls">
      <div
        v-if="hasSizes"
        class="merchandise-card__size"
        role="group"
        :aria-label="t('addons.sizeAria', { name: addon.name })"
        :aria-invalid="hasError ? 'true' : undefined"
        :aria-describedby="hasError ? errorMessageId : undefined"
      >
        <span class="merchandise-card__size-label">{{ t('addons.size') }}</span>
        <q-select
          ref="sizeSelectRef"
          v-model="sizeModel"
          class="merchandise-card__size-select"
          dense
          outlined
          options-dense
          :options="addon.sizes"
          :disable="!isSelected"
          :error="hasError"
          hide-bottom-space
          hide-dropdown-icon
          :placeholder="t('addons.selectSize')"
          :aria-label="t('addons.selectSizeAria', { name: addon.name })"
          :aria-invalid="hasError ? 'true' : undefined"
          :aria-describedby="hasError ? errorMessageId : undefined"
        >
          <template #append>
            <q-icon
              name="arrow_drop_down"
              size="16px"
            />
          </template>
        </q-select>
      </div>

      <quantity-picker
        ref="quantityPickerRef"
        v-model="quantityModel"
        :max="addon.maxQuantity"
        :item-name="addon.name"
      />
    </div>

    <p
      v-if="isSelected"
      class="merchandise-card__added"
      role="status"
    >
      {{ t('addons.added') }}
    </p>

    <p
      v-if="hasError && errorMessage"
      :id="errorMessageId"
      class="merchandise-card__error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </q-card>
</template>

<style scoped src="./MerchandiseCard.css"></style>
