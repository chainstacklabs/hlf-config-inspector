<template>
  <router-view />
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
// Store
import { settings } from "@/store";

@Component
export default class App extends Vue {
  constructor() {
    super();

    if (settings.darkTheme === null) {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        settings.setDarkTheme(true);
      } else {
        settings.setDarkTheme(false);
      }
    }
  }

  get darkThemeSetting() {
    return settings.darkTheme;
  }

  @Watch("darkThemeSetting", { immediate: true })
  onDarkThemeChange() {
    this.$vuetify.theme.dark = settings.darkTheme!;
  }
}
</script>

<style>
html {
  overflow: hidden !important;
}
</style>
