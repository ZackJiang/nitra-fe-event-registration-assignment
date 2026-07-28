<script setup>
import { computed } from 'vue'

const props = defineProps({
  fieldIssues: {
    type: Object,
    default: () => ({}),
  },
  shippingRequired: {
    type: Boolean,
    default: false,
  },
})

const fullName = defineModel('fullName', { type: String, required: true })
const email = defineModel('email', { type: String, required: true })
const phone = defineModel('phone', { type: String, required: true })
const company = defineModel('company', { type: String, required: true })
const jobTitle = defineModel('jobTitle', { type: String, required: true })
const shippingAddress = defineModel('shippingAddress', { type: String, required: true })

const fieldModels = {
  fullName,
  email,
  phone,
  company,
  jobTitle,
  shippingAddress,
}

const fieldDefinitions = computed(() => [
  {
    id: 'fullName',
    label: 'Full Name',
    type: 'text',
    autocomplete: 'name',
    placeholder: 'Enter your full name',
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    autocomplete: 'email',
    placeholder: 'Enter your email address',
  },
  {
    id: 'phone',
    label: 'Phone',
    type: 'tel',
    autocomplete: 'tel',
    placeholder: 'Enter your phone number',
  },
  {
    id: 'company',
    label: 'Company',
    type: 'text',
    autocomplete: 'organization',
    placeholder: 'Enter your company name',
  },
  {
    id: 'jobTitle',
    label: 'Job Title',
    type: 'text',
    autocomplete: 'organization-title',
    placeholder: 'Enter your job title',
    wide: true,
  },
  {
    id: 'shippingAddress',
    label: props.shippingRequired
      ? 'Shipping Address'
      : 'Shipping Address (Optional)',
    type: 'text',
    autocomplete: 'street-address',
    placeholder: 'Enter your shipping address',
    wide: true,
  },
])

const fieldRefs = {}

function setFieldRef(fieldId, fieldComponent) {
  if (fieldComponent) {
    fieldRefs[fieldId] = fieldComponent
  }
}

function focusField(fieldId) {
  const field = fieldRefs[fieldId]

  if (!field || typeof field.focus !== 'function') {
    return false
  }

  field.focus()
  return true
}

defineExpose({
  focusField,
})
</script>

<template>
  <section
    class="attendee-information"
    aria-labelledby="attendee-information-heading"
  >
    <h2
      id="attendee-information-heading"
      class="attendee-information__heading"
    >
      Attendee Information
    </h2>

    <q-form
      class="attendee-information__grid"
      novalidate
      @submit.prevent
    >
      <div
        v-for="field in fieldDefinitions"
        :key="field.id"
        class="attendee-field"
        :class="{ 'attendee-field--wide': field.wide }"
      >
        <label
          class="attendee-field__label"
          :for="`attendee-${field.id}`"
        >
          {{ field.label }}
        </label>

        <q-input
          :for="`attendee-${field.id}`"
          :ref="(component) => setFieldRef(field.id, component)"
          :model-value="fieldModels[field.id].value"
          class="attendee-field__input"
          outlined
          dense
          hide-bottom-space
          no-error-icon
          :type="field.type"
          :autocomplete="field.autocomplete"
          :placeholder="field.placeholder"
          :error="Boolean(fieldIssues[field.id])"
          :error-message="fieldIssues[field.id]?.message"
          :aria-invalid="fieldIssues[field.id] ? 'true' : undefined"
          @update:model-value="fieldModels[field.id].value = $event"
        />
      </div>
    </q-form>
  </section>
</template>

<style scoped>
.attendee-information {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--space-3xl);
}

.attendee-information__heading {
  margin: 0;
  font-size: var(--font-size-h3);
  font-weight: 630;
  line-height: var(--line-height-h3);
}

.attendee-information__grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-xl) var(--space-2xl);
}

.attendee-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--space-xs);
}

.attendee-field--wide {
  grid-column: 1 / -1;
}

.attendee-field__label {
  color: var(--text-neutral-default);
  font-size: var(--font-size-sm);
  font-weight: 570;
  line-height: var(--line-height-sm);
}

.attendee-field__input :deep(.q-field__control) {
  min-height: var(--control-height-lg);
  border-radius: var(--radius-md);
  background: var(--bg-surface-l0);
  color: var(--text-neutral-default);
}

.attendee-field__input :deep(.q-field__native) {
  min-height: var(--control-height-lg);
  padding: var(--space-control) var(--space-md);
  color: var(--text-neutral-default);
  font-size: var(--font-size-lg);
  font-weight: 485;
  line-height: var(--line-height-lg);
}

.attendee-field__input :deep(.q-field__native::placeholder) {
  color: var(--text-neutral-quiet);
  opacity: 1;
}

.attendee-field__input :deep(.q-field__control::before) {
  border-color: var(--border-neutral-muted);
}

.attendee-field__input :deep(.q-field__bottom) {
  min-height: var(--line-height-caption);
  padding: var(--space-xs) 0 0;
  color: var(--text-danger-default);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-caption);
}

@media (max-width: 767px) {
  .attendee-information__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .attendee-field--wide {
    grid-column: auto;
  }
}
</style>
