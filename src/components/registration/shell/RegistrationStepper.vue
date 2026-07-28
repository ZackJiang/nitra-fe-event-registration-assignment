<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import errorStepIcon from '../../../assets/brand/stepper-error.svg'
import { isWizardStepId, WIZARD_STEPS } from '../../../constants/wizard.js'

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
const errorIcon = `img:${errorStepIcon}`
const { t } = useI18n()

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
      :error-icon="errorIcon"
      @update:model-value="requestStep"
    >
      <q-step
        v-for="step in steps"
        :key="step.id"
        :name="step.id"
        :title="t(step.labelKey)"
        :prefix="step.id"
        :done="step.id < currentStep && !errorSteps.has(step.id)"
        :error="errorSteps.has(step.id)"
        :active-icon="errorSteps.has(step.id) ? errorIcon : 'none'"
        :active-color="errorSteps.has(step.id) ? 'negative' : undefined"
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
  min-height: var(--control-height-sm);
  min-width: 0;
  flex: 1 1 0;
  padding: 0;
  color: var(--text-neutral-quiet);
  font-size: var(--font-size-tab);
  font-weight: 485;
}

/* Keep clickable step tabs visually neutral on pointer hover while preserving keyboard focus. */
body.desktop .registration-stepper :deep(.q-hoverable:hover > .q-focus-helper) {
  opacity: 0;
}

body.desktop .registration-stepper :deep(.q-focusable:focus > .q-focus-helper) {
  opacity: 0;
}

body.desktop .registration-stepper :deep(.q-focusable:focus-visible > .q-focus-helper) {
  opacity: 0.22;
}

.registration-stepper :deep(.q-stepper__tab > .q-ripple) {
  display: none;
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

.registration-stepper :deep(.q-stepper__tab--error .q-stepper__label),
.registration-stepper :deep(.q-stepper__tab--error .q-stepper__title) {
  color: var(--text-danger-default) !important;
}

.registration-stepper :deep(.q-stepper__dot) {
  width: var(--stepper-dot-size);
  min-width: var(--stepper-dot-size);
  height: var(--stepper-dot-size);
  margin-right: var(--space-control);
  background: var(--bg-surface-l2);
  color: var(--text-neutral-quiet);
  font-size: var(--font-size-control);
  font-weight: 610;
}

.registration-stepper :deep(.q-stepper__tab--active .q-stepper__dot),
.registration-stepper :deep(.q-stepper__tab--done .q-stepper__dot) {
  background: var(--bg-brand-emphasis-rest);
  color: var(--text-inverse-default);
}

.registration-stepper :deep(.q-stepper__tab--error-with-icon .q-stepper__dot) {
  background: transparent !important;
}

.registration-stepper :deep(.q-stepper__tab--error-with-icon .q-stepper__dot .q-icon) {
  font-size: var(--stepper-error-icon-size) !important;
}

.registration-stepper :deep(.q-stepper__label::after),
.registration-stepper :deep(.q-stepper__dot::before),
.registration-stepper :deep(.q-stepper__dot::after) {
  height: var(--stepper-connector-height);
  background: var(--bg-surface-l2);
}

.registration-stepper :deep(.q-stepper__tab--done .q-stepper__label::after),
.registration-stepper :deep(.q-stepper__tab--done .q-stepper__dot::before),
.registration-stepper :deep(.q-stepper__tab--done .q-stepper__dot::after) {
  background: var(--bg-brand-emphasis-rest);
}

/* A connector belongs to both adjacent steps. Keep both halves neutral after an error. */
.registration-stepper :deep(.q-stepper__tab--error + .q-stepper__tab .q-stepper__dot::before) {
  background: var(--bg-surface-l2) !important;
}

/* An invalid step still closes the completed connector coming from a valid step. */
.registration-stepper :deep(.q-stepper__tab--done + .q-stepper__tab--error .q-stepper__dot::before) {
  background: var(--bg-brand-emphasis-rest);
}

/* The active dot closes the connector coming from the completed step. */
.registration-stepper :deep(.q-stepper__tab--active .q-stepper__dot::before) {
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
