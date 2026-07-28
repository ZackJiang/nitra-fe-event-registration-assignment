<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatUsd } from '../../../utils/registrationPricing.js'

const props = defineProps({
  pricingBreakdown: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  totalLabel: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'sidebar',
    validator: (value) => ['sidebar', 'review'].includes(value),
  },
})
const { locale, t } = useI18n()
const displayTitle = computed(() => props.title || t('summary.title'))
const displayTotalLabel = computed(() => props.totalLabel || t('summary.total'))

const hasItems = computed(() => (
  Boolean(props.pricingBreakdown.ticketLine)
  || props.pricingBreakdown.addonLines.length > 0
))

function getTicketLabel(line) {
  return t('summary.ticket', { name: line.label })
}

function getAddonLabel(line) {
  return line.category === 'merchandise'
    ? t('summary.merchandise', { name: line.label, quantity: line.quantity })
    : line.label
}
</script>

<template>
  <q-card
    class="order-summary"
    :class="`order-summary--${variant}`"
    flat
    bordered
    tag="aside"
    aria-labelledby="order-summary-heading"
  >
    <h2
      id="order-summary-heading"
      class="order-summary__heading"
    >
      {{ displayTitle }}
    </h2>

    <p
      v-if="!hasItems"
      class="order-summary__empty"
    >
      {{ t('summary.empty') }}
    </p>

    <div
      v-if="pricingBreakdown.ticketLine"
      class="order-summary__line"
    >
      <span>{{ getTicketLabel(pricingBreakdown.ticketLine) }}</span>
      <span>{{ formatUsd(pricingBreakdown.ticketLine.lineTotalCents, locale) }}</span>
    </div>

    <div
      v-for="line in pricingBreakdown.addonLines"
      :key="line.sourceId"
      class="order-summary__line"
    >
      <span>{{ getAddonLabel(line) }}</span>
      <span>{{ formatUsd(line.lineTotalCents, locale) }}</span>
    </div>

    <div
      v-if="pricingBreakdown.discountCents > 0"
      class="order-summary__line order-summary__discount"
    >
      <span>{{ t('summary.workshopDiscount') }}</span>
      <span>-{{ formatUsd(pricingBreakdown.discountCents, locale) }}</span>
    </div>

    <q-separator class="order-summary__separator" />

    <div class="order-summary__line order-summary__total">
      <span>{{ displayTotalLabel }}</span>
      <span>{{ formatUsd(pricingBreakdown.totalCents, locale) }}</span>
    </div>
  </q-card>
</template>

<style scoped>
.order-summary {
  display: flex;
  width: var(--wizard-summary-width);
  min-width: 0;
  flex: 0 0 var(--wizard-summary-width);
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-2xl);
  border-color: var(--border-neutral-muted);
  border-radius: var(--radius-md);
  background: var(--bg-surface-l1);
  box-shadow: none;
  color: var(--text-neutral-default);
}

.order-summary__heading,
.order-summary__empty {
  margin: 0;
}

.order-summary__heading {
  font-size: var(--font-size-subtitle1);
  font-weight: 610;
  line-height: var(--line-height-subtitle1);
}

.order-summary__empty,
.order-summary__line {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-sm);
}

.order-summary__empty {
  color: var(--text-neutral-muted);
}

.order-summary__line {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-lg);
  color: var(--text-neutral-muted);
}

.order-summary__line span:first-child {
  min-width: 0;
  overflow-wrap: anywhere;
}

.order-summary__line span:last-child {
  flex: 0 0 auto;
  white-space: nowrap;
}

.order-summary__discount {
  color: var(--text-brand-emphasis);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-caption);
}

.order-summary__separator {
  background: var(--divider-muted);
}

.order-summary__total {
  color: var(--text-neutral-default);
  font-weight: 570;
}

.order-summary--review {
  width: 100%;
  flex-basis: auto;
  gap: var(--space-sm);
}

@media (max-width: 1023px) {
  .order-summary {
    width: 100%;
    flex-basis: auto;
  }
}
</style>
