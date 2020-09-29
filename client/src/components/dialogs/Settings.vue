<template>
  <v-dialog v-model="dialogOpen" v-if="dialogOpen" max-width="400px">
    <v-card>
      <v-card-title>
        <span class="headline">Settings</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <div class="d-flex mt-2">
            <v-icon>
              mdi-brightness-4
            </v-icon>
            <div class="display-1 ml-2 mr-4">Dark mode</div>
            <v-spacer />
            <v-switch
              v-model="settings.darkTheme"
              class="ma-0 pa-0"
              color="primary lighten-2"
              hide-details
            />
          </div>
          <div class="d-flex mt-2">
            <v-icon>
              mdi-image
            </v-icon>
            <div class="display-1 ml-2 mr-4">Background animation</div>
            <v-spacer />
            <v-switch
              v-model="settings.bgAnimation"
              class="ma-0 pa-0"
              color="primary lighten-2"
              hide-details
            />
          </div>
        </v-container>
      </v-card-text>
      <v-card-actions class="pb-6 px-9">
        <v-spacer></v-spacer>
        <v-btn color="normal" text @click="hideDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
// Types
import { Vue, Component, Watch } from "vue-property-decorator";
// Store
import { settings as settingsStore } from "@/store";

@Component
export default class Settings extends Vue {
  private dialogOpen = false;
  private settings = {
    darkTheme: settingsStore.darkTheme || false,
    bgAnimation: settingsStore.bgAnimation
  };

  constructor() {
    super();
  }

  hideDialog() {
    this.dialogOpen = false;
  }
  showDialog() {
    this.dialogOpen = true;
  }

  @Watch("settings.darkTheme")
  onDarkThemeChange() {
    settingsStore.setDarkTheme(this.settings.darkTheme);
  }
  @Watch("settings.bgAnimation")
  onBgAnimationChange() {
    settingsStore.setBgAnimation(this.settings.bgAnimation);
  }
}
</script>
