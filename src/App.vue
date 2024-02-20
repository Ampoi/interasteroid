<template>
    <p>mode: {{ mode }}</p>
    <p>part: {{ selectedPart }}</p>
</template>
<script setup lang="ts">
import { mode, selectedPart } from "./hooks/switchMode"
import { createDrawer } from "./draw/main"

createDrawer()
</script>