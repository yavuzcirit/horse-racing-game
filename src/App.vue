<script setup lang="ts">
import { storeToRefs } from 'pinia'
import AppHeader from '@/app/AppHeader.vue'
import { CommentaryFeed } from '@/features/commentary'
import { NewSessionButton, useGameSession } from '@/features/game'
import { HorseList } from '@/features/horses'
import { ProgramPanel, RaceTrack, ResultsPanel, useRaceStore } from '@/features/race'

useGameSession()

const { activeHorseIds } = storeToRefs(useRaceStore())
</script>

<template>
  <AppHeader />
  <main class="layout">
    <HorseList class="layout__horses" :active-horse-ids="activeHorseIds">
      <template #actions>
        <NewSessionButton />
      </template>
    </HorseList>

    <div class="layout__race">
      <RaceTrack />
      <CommentaryFeed class="layout__commentary" />
    </div>

    <div class="layout__schedule">
      <ProgramPanel />
      <ResultsPanel />
    </div>
  </main>
</template>

<style scoped>
.layout {
  --panel-height: calc(100dvh - var(--header-height) - 2 * var(--space-4));

  display: grid;
  grid-template-columns: minmax(340px, 400px) minmax(0, 1fr) minmax(440px, 520px);
  grid-template-areas: 'horses race schedule';
  align-items: start;
  gap: var(--space-4);
  padding: var(--space-4);
  max-width: 1920px;
  margin: 0 auto;
}

.layout__horses {
  grid-area: horses;
  max-height: var(--panel-height);
}

.layout__race {
  grid-area: race;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
}

.layout__commentary {
  max-height: 260px;
}

.layout__schedule {
  grid-area: schedule;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: var(--space-4);
  height: var(--panel-height);
  min-height: 0;
}

@media (max-width: 1399px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      'race race'
      'horses schedule';
  }

  .layout__horses,
  .layout__schedule {
    height: 640px;
    max-height: none;
  }
}

@media (max-width: 899px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'race'
      'schedule'
      'horses';
    padding: var(--space-3);
    gap: var(--space-3);
  }

  .layout__horses {
    height: auto;
    max-height: 560px;
  }

  .layout__schedule {
    height: auto;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-3);
  }

  .layout__schedule > * {
    max-height: 420px;
  }
}
</style>
