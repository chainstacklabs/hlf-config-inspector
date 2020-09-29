<template>
  <v-list two-line>
    <v-subheader v-if="profiles.length">Connection profiles</v-subheader>
    <v-list-item-group v-model="profileIdx" color="primary">
      <v-list-item v-for="(profile, i) in profiles" :key="i">
        <v-list-item-content>
          <v-list-item-title v-text="profile.name"></v-list-item-title>
          <v-list-item-subtitle
            v-text="profile.description"
          ></v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-dialog v-model="dialogs[i]" max-width="800px" scrollable>
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                v-on="on"
                @click.stop.prevent=""
                @mousedown.stop
                @touchstart.native.stop
              >
                <v-icon color="grey lighten-1">
                  mdi-magnify
                </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="mb-4">
                <span class="headline">Connection Profile</span>
              </v-card-title>
              <v-card-text class="py-0">
                <code class="yaml pa-2">{{ profile }}</code>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn text @click="dialogs[i] = false">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-list-item-action>
      </v-list-item>
    </v-list-item-group>
    <v-subheader>Import a new connection profile</v-subheader>
    <v-list-item>
      <v-btn color="primary" @click="onButtonClick">
        <v-icon left>mdi-upload</v-icon>
        Upload connection profile
      </v-btn>
      <input
        ref="uploader"
        class="d-none"
        type="file"
        accept="application/json"
        @change="onFileChanged"
      />
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
// Types
import { Vue, Component, Prop, Watch, Ref } from "vue-property-decorator";
// Store
import { connectionProfiles } from "@/store";
// Utils
import { readFile } from "@/utils/file";

@Component
export default class ConnectionProfileSelector extends Vue {
  private dialogs = {};
  private profileIdx: number | null = null;

  get profiles() {
    return connectionProfiles.all;
  }

  @Prop({ required: true }) private value!: any;

  @Ref("uploader") private uploader!: HTMLInputElement;

  @Watch("profileIdx")
  onProfileIdxChange() {
    if (this.profileIdx != null && this.profileIdx! >= 0) {
      this.$emit("input", this.profiles[this.profileIdx!]);
    } else {
      this.$emit("input", null);
    }
  }

  onButtonClick() {
    this.uploader.click();
  }

  async onFileChanged(e: { target: HTMLInputElement }) {
    const file = e.target.files![0];

    const profile = JSON.parse(await readFile(file));

    await connectionProfiles.addConnectionProfile(profile);
  }
}
</script>

<style scoped lang="scss">
.v-list-item--active {
  color: white;
  background-color: var(--v-primary-lighten1);

  .v-list-item__subtitle {
    color: #ddd;
  }
}
</style>
