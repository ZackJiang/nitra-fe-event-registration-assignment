<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineProps({
  showBack: {
    type: Boolean,
    default: false,
  },
  primaryLabel: {
    type: String,
    required: true,
  },
  primaryDisabled: {
    type: Boolean,
    default: false,
  },
  primaryLoading: {
    type: Boolean,
    default: false,
  },
})

defineEmits({
  back: null,
  primary: null,
})
</script>

<template>
  <footer class="registration-action-bar bg-surface-l0">
    <div
      class="registration-action-bar__inner wizard-content-container"
      :class="{ 'registration-action-bar__inner--single': !showBack }"
    >
      <q-btn
        v-if="showBack"
        class="registration-action-bar__back wizard-focus-ring"
        unelevated
        no-caps
        :label="t('actions.back')"
        @click="$emit('back')"
      />

      <q-btn
        class="registration-action-bar__primary wizard-focus-ring"
        unelevated
        no-caps
        color="accent"
        :label="primaryLabel"
        :disable="primaryDisabled"
        :loading="primaryLoading"
        @click="$emit('primary')"
      />
    </div>
  </footer>
</template>

<style scoped>
.registration-action-bar {
  min-height: var(--wizard-action-height);
  border-top: 1px solid var(--divider-default);
}

.registration-action-bar__inner {
  display: flex;
  min-height: var(--wizard-action-height);
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  padding-top: var(--space-lg);
  padding-bottom: var(--space-lg);
}

.registration-action-bar__inner--single {
  justify-content: flex-end;
}

.registration-action-bar__back,
.registration-action-bar__primary {
  min-width: var(--action-button-min-width);
  min-height: var(--control-height-md);
  border-radius: var(--radius-control);
  font-size: var(--font-size-control);
  font-weight: 610;
  line-height: var(--line-height-control);
}

.registration-action-bar__back {
  background: var(--bg-neutral-muted-rest);
  color: var(--text-neutral-muted);
}

@media (max-width: 767px) {
  .registration-action-bar__primary {
    height: auto;
    white-space: normal;
  }
}
</style>
