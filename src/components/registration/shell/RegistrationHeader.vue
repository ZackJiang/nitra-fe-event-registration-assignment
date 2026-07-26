<script setup>
import emblemBottomLeftUrl from '../../../assets/brand/nitra-emblem-bottom-left.svg'
import emblemCenterUrl from '../../../assets/brand/nitra-emblem-center.svg'
import emblemTopRightUrl from '../../../assets/brand/nitra-emblem-top-right.svg'

defineProps({
  eventName: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <header class="registration-header bg-surface-l0">
    <q-toolbar class="registration-header__toolbar wizard-header-container">
      <span class="registration-header__logo bg-brand-emphasis-rest" aria-hidden="true">
        <span class="registration-header__emblem">
          <img
            class="registration-header__emblem-center"
            :src="emblemCenterUrl"
            alt=""
          >
          <img
            class="registration-header__emblem-top-right"
            :src="emblemTopRightUrl"
            alt=""
          >
          <img
            class="registration-header__emblem-bottom-left"
            :src="emblemBottomLeftUrl"
            alt=""
          >
        </span>
      </span>

      <span class="registration-header__event-name text-h4 text-neutral">
        {{ eventName }}
      </span>
    </q-toolbar>
  </header>
</template>

<style scoped>
.registration-header {
  border-bottom: 1px solid var(--divider-default);
}

.registration-header__toolbar {
  min-height: var(--wizard-header-height);
  gap: var(--space-md);
}

.registration-header__logo {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  overflow: hidden;
  border-radius: var(--radius-lg);
}

.registration-header__emblem {
  position: relative;
  width: 28px;
  height: 14.023px;
}

.registration-header__emblem img {
  position: absolute;
  display: block;
}

.registration-header__emblem-center {
  inset: 0 25%;
  width: 50%;
  height: 100%;
}

.registration-header__emblem-top-right {
  inset: 0 0 50% 75%;
  width: 25%;
  height: 50%;
}

.registration-header__emblem-bottom-left {
  inset: 50% 75% 0 0;
  width: 25%;
  height: 50%;
}

.registration-header__event-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
