<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  emptyMessage: {
    type: String,
    default: '',
  },
  issues: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <p
    v-if="rows.length === 0 && emptyMessage"
    class="review-rows__empty"
  >
    {{ emptyMessage }}
  </p>

  <div
    v-else-if="rows.length > 0"
    class="review-rows__list"
  >
    <div
      v-for="row in rows"
      :key="row.id"
      class="review-rows__row"
    >
      <span>{{ row.label }}</span>
      <span :class="{ 'review-rows__value--error': row.hasError }">
        {{ row.value }}
      </span>
    </div>
  </div>

  <p
    v-for="issue in issues"
    :key="`${issue.code}:${issue.targetIds.join(':')}`"
    class="review-rows__issue"
  >
    {{ t(`validation['${issue.code}']`, issue.params) }}
  </p>
</template>

<style scoped>
.review-rows__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.review-rows__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: var(--space-lg);
  color: var(--text-neutral-muted);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-sm);
}

.review-rows__row > :last-child {
  color: var(--text-neutral-default);
  overflow-wrap: anywhere;
  text-align: right;
}

.review-rows__row > .review-rows__value--error,
.review-rows__issue {
  color: var(--text-danger-default);
}

.review-rows__empty,
.review-rows__issue {
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-sm);
}

.review-rows__empty {
  color: var(--text-neutral-muted);
}

@media (max-width: 767px) {
  .review-rows__row {
    grid-template-columns: 1fr;
    gap: var(--space-2xs);
  }

  .review-rows__row > :last-child {
    text-align: left;
  }
}
</style>
