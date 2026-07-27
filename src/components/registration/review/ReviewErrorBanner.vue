<script setup>
import { nextTick, ref } from 'vue'

defineProps({
  issues: {
    type: Array,
    default: () => [],
  },
})

defineEmits({
  navigate: (stepId) => Number.isInteger(stepId),
})

const headingRef = ref(null)

async function focus() {
  await nextTick()
  headingRef.value?.focus()
}

defineExpose({
  focus,
})
</script>

<template>
  <q-banner
    class="review-error-banner"
    role="alert"
    rounded
  >
    <p
      ref="headingRef"
      class="review-error-banner__heading"
      tabindex="-1"
    >
      Please fix the following errors before submitting
    </p>

    <ul class="review-error-banner__list">
      <li
        v-for="issue in issues"
        :key="`${issue.code}:${issue.targetIds.join(':')}`"
      >
        <q-btn
          class="review-error-banner__link wizard-focus-ring"
          flat
          dense
          no-caps
          type="button"
          :label="`Step ${issue.stepId}: ${issue.message}`"
          @click="$emit('navigate', issue.stepId)"
        />
      </li>
    </ul>
  </q-banner>
</template>

<style scoped>
.review-error-banner {
  border: 1px solid var(--border-danger-muted);
  background: var(--bg-danger-muted-rest);
  color: var(--text-danger-default);
}

.review-error-banner__heading,
.review-error-banner__list {
  margin: 0;
}

.review-error-banner__heading {
  font-size: var(--font-size-sm);
  font-weight: 570;
  line-height: var(--line-height-sm);
}

.review-error-banner__list {
  padding-left: var(--space-lg);
}

.review-error-banner__link {
  min-height: auto;
  padding: 0;
  color: inherit;
  font-size: var(--font-size-sm);
  font-weight: 485;
  line-height: var(--line-height-sm);
  text-align: left;
  text-decoration: underline;
}
</style>
