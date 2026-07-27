<script setup>
import successIconUrl from '../../../assets/brand/registration-success.svg'

defineProps({
  eventName: {
    type: String,
    required: true,
  },
  confirmationId: {
    type: String,
    required: true,
  },
  attendee: {
    type: Object,
    required: true,
  },
  selectedTicket: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits({
  'back-home': null,
})

function focusHeading() {
  const heading = document.getElementById('registration-success-heading')

  if (!heading) {
    return false
  }

  heading.focus()
  return true
}

defineExpose({
  focusHeading,
})
</script>

<template>
  <section
    class="registration-success"
    aria-labelledby="registration-success-heading"
  >
    <div class="registration-success__hero">
      <img
        class="registration-success__icon"
        :src="successIconUrl"
        alt=""
        aria-hidden="true"
      >

      <h1
        id="registration-success-heading"
        class="registration-success__heading"
        tabindex="-1"
      >
        Registration Complete!
      </h1>

      <p class="registration-success__confirmation">
        Confirmation #{{ confirmationId }}
      </p>

      <p class="registration-success__message">
        Thank you, {{ attendee.fullName }}! Your {{ selectedTicket.name }} registration for
        {{ eventName }} is confirmed.<br>
        You will receive a confirmation email at {{ attendee.email }}.
      </p>

      <q-btn
        class="registration-success__button wizard-focus-ring"
        unelevated
        no-caps
        color="accent"
        label="Back to Home"
        @click="emit('back-home')"
      />
    </div>
  </section>
</template>

<style scoped>
.registration-success {
  display: flex;
  width: 100%;
  flex: 1 0 auto;
  flex-direction: column;
  align-items: center;
  padding-top: var(--space-6xl);
  padding-bottom: var(--space-6xl);
}

.registration-success__hero {
  display: flex;
  width: min(100%, 720px);
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  text-align: center;
}

.registration-success__icon {
  display: block;
  width: 80px;
  height: 80px;
}

.registration-success__heading,
.registration-success__confirmation,
.registration-success__message {
  margin: 0;
  overflow-wrap: anywhere;
}

.registration-success__heading {
  color: var(--text-success-default);
  font-size: var(--font-size-h2);
  font-weight: 680;
  line-height: var(--line-height-h2);
}

.registration-success__confirmation {
  color: var(--text-neutral-default);
  font-size: var(--font-size-lg);
  font-weight: 485;
  line-height: var(--line-height-lg);
}

.registration-success__message {
  color: var(--text-neutral-muted);
  font-size: var(--font-size-sm);
  font-weight: 485;
  line-height: var(--line-height-sm);
}

.registration-success__button {
  min-height: 40px;
  margin-top: var(--space-xs);
  border-radius: var(--radius-control);
  font-size: 14px;
  font-weight: 610;
  line-height: 20px;
}

@media (max-width: 767px) {
  .registration-success {
    padding-top: var(--space-4xl);
    padding-bottom: var(--space-4xl);
  }

  .registration-success__icon {
    width: 64px;
    height: 64px;
  }
}
</style>
