<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineProps({
  title: {
    type: String,
    required: true,
  },
  stepId: {
    type: Number,
    required: true,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
})

defineEmits({
  edit: (stepId) => Number.isInteger(stepId),
})
</script>

<template>
  <q-card
    class="review-section"
    :class="{ 'review-section--error': hasError }"
    flat
    bordered
    tag="section"
    :aria-labelledby="`review-section-${stepId}`"
  >
    <div class="review-section__header">
      <h2
        :id="`review-section-${stepId}`"
        class="review-section__heading"
      >
        {{ title }}
      </h2>

      <q-btn
        class="review-section__edit wizard-focus-ring"
        flat
        dense
        no-caps
        type="button"
        :label="t('actions.editStep', { step: stepId })"
        @click="$emit('edit', stepId)"
      />
    </div>

    <div class="review-section__content">
      <slot />
    </div>
  </q-card>
</template>

<style scoped>
.review-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-xl);
  border-color: var(--border-neutral-muted);
  border-radius: var(--radius-md);
  background: var(--bg-surface-l1);
  color: var(--text-neutral-default);
}

.review-section--error {
  border-width: var(--border-width-emphasis);
  border-color: var(--border-danger-emphasis);
}

.review-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
}

.review-section__heading {
  margin: 0;
  font-size: var(--font-size-subtitle1);
  font-weight: 610;
  line-height: var(--line-height-subtitle1);
}

.review-section--error .review-section__heading {
  color: var(--text-danger-default);
}

.review-section__edit {
  min-height: auto;
  padding: 0;
  color: var(--text-brand-emphasis);
  font-size: var(--font-size-xs);
  font-weight: 610;
  line-height: var(--line-height-sm);
  text-decoration: underline;
}

.review-section__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
</style>
