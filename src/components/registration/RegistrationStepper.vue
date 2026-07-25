<script setup>
import { computed } from 'vue'
import { isWizardStepId, WIZARD_STEPS } from '../../constants/wizard.js'

const props = defineProps({
  steps: {
    type: Array,
    default: () => WIZARD_STEPS,
  },
  errorStepIds: {
    type: Array,
    default: () => [],
    validator: (stepIds) => stepIds.every(isWizardStepId),
  },
})

const emit = defineEmits({
  'step-request': isWizardStepId,
})

const currentStep = defineModel('currentStep', {
  type: Number,
  required: true,
  validator: isWizardStepId,
})

const errorSteps = computed(() => new Set(props.errorStepIds))

function canNavigateTo(stepId) {
  return stepId <= currentStep.value || errorSteps.value.has(stepId)
}

function requestStep(stepId) {
  if (!canNavigateTo(stepId) || stepId === currentStep.value) {
    return
  }

  emit('step-request', stepId)
  currentStep.value = stepId
}
</script>

<template>
  <div class="registration-stepper-shell bg-surface-l0">
    <q-stepper
      class="registration-stepper"
      flat
      header-nav
      :model-value="currentStep"
      active-color="primary"
      done-color="primary"
      error-color="negative"
      inactive-color="grey-6"
      done-icon="check"
      active-icon="none"
      error-icon="priority_high"
      @update:model-value="requestStep"
    >
      <q-step
        v-for="step in steps"
        :key="step.id"
        :name="step.id"
        :title="step.label"
        :prefix="step.id"
        :done="step.id < currentStep && !errorSteps.has(step.id)"
        :error="errorSteps.has(step.id)"
        :header-nav="canNavigateTo(step.id)"
      >
        <slot v-if="step.id === currentStep" />
      </q-step>
    </q-stepper>
  </div>
</template>

<style scoped>
.registration-stepper-shell {
  border-bottom: 1px solid var(--divider-default);
}

.registration-stepper {
  width: 100%;
  max-width: var(--wizard-shell-max-width);
  margin: 0 auto;
  border-radius: 0;
}

.registration-stepper :deep(.q-stepper__header) {
  width: 100%;
  min-height: var(--wizard-stepper-height);
  overflow: hidden;
  padding: var(--space-2xl) var(--wizard-content-gutter);
  box-shadow: none;
}

.registration-stepper :deep(.q-stepper__tab) {
  width: 25%;
  min-height: 32px;
  min-width: 0;
  flex: 1 1 0;
  padding: 0;
  color: var(--text-neutral-quiet);
  font-size: 13px;
  font-weight: 485;
}

.registration-stepper :deep(.q-stepper__tab--active),
.registration-stepper :deep(.q-stepper__tab--done) {
  color: var(--text-neutral-default) !important;
  font-weight: 610;
}

.registration-stepper :deep(.q-stepper__tab--error) {
  color: var(--text-danger-default);
  font-weight: 610;
}

.registration-stepper :deep(.q-stepper__dot) {
  width: 32px;
  min-width: 32px;
  height: 32px;
  margin-right: var(--space-control);
  background: var(--bg-surface-l2);
  color: var(--text-neutral-quiet);
  font-size: 14px;
  font-weight: 610;
}

.registration-stepper :deep(.q-stepper__tab--active .q-stepper__dot),
.registration-stepper :deep(.q-stepper__tab--done .q-stepper__dot) {
  background: var(--bg-brand-emphasis-rest);
  color: var(--text-inverse-default);
}

.registration-stepper :deep(.q-stepper__tab--error-with-icon .q-stepper__dot) {
  background: var(--bg-danger-emphasis-rest) !important;
  color: var(--text-inverse-default);
}

.registration-stepper :deep(.q-stepper__dot span) {
  color: currentColor;
}

.registration-stepper :deep(.q-stepper__label::after),
.registration-stepper :deep(.q-stepper__dot::before),
.registration-stepper :deep(.q-stepper__dot::after) {
  height: 2px;
  background: var(--bg-surface-l2);
}

.registration-stepper :deep(.q-stepper__tab--done .q-stepper__label::after),
.registration-stepper :deep(.q-stepper__tab--done .q-stepper__dot::before),
.registration-stepper :deep(.q-stepper__tab--done .q-stepper__dot::after) {
  background: var(--bg-brand-emphasis-rest);
}

.registration-stepper :deep(.q-stepper__step-inner) {
  padding: 0;
}

@media (max-width: 767px) {
  .registration-stepper :deep(.q-stepper__header) {
    min-height: var(--wizard-stepper-height);
  }

  .registration-stepper :deep(.q-stepper__tab) {
    justify-content: center;
  }

  .registration-stepper :deep(.q-stepper__dot) {
    margin: 0;
  }

  .registration-stepper :deep(.q-stepper__label) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .registration-stepper :deep(.q-stepper__tab:not(:last-child) .q-stepper__dot::after) {
    display: block;
    left: 100%;
    width: 100vw;
    margin-left: var(--space-lg);
  }
}
</style>
