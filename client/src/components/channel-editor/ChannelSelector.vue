<template>
  <v-list>
    <v-subheader v-if="channels.length">
      Choose an channel
    </v-subheader>
    <v-list-item-group v-model="channelIdx" color="primary">
      <v-list-item v-for="channel in channels" :key="channel">
        <v-list-item-content>
          <v-list-item-title v-text="channel" />
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
    <v-subheader v-if="error">
      No channel available
    </v-subheader>
    <v-alert type="error" class="mx-3 mt-2" v-if="error">
      {{ error }}
    </v-alert>
  </v-list>
</template>

<script lang="ts">
// Types
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import ConnectionProfile, { Channel } from "@/types/ConnectionProfile";
import Identity from "@/types/Identity.v2";

@Component({
  components: {
    Subjects: () => import("@/components/Subjects.vue")
  }
})
export default class ChannelSelector extends Vue {
  private channelIdx: number | null = null;
  private channels: string[] = [];

  private error: Error | null = null;

  @Prop({ required: true }) value!: any;

  @Prop({ required: true }) connectionProfile!: ConnectionProfile;
  @Prop({ required: true }) identity!: Identity;

  constructor() {
    super();

    this.refreshChannels();

    if (this.channels.length === 1) {
      this.channelIdx = 0;
    }
  }

  refreshChannels() {
    this.error = null;
    this.channels = [];

    if (!this.connectionProfile || !this.identity) {
      return;
    }

    const orgOfIdentity = Object.values(
      this.connectionProfile.organizations
    ).find(org => org.mspid === this.identity.mspId);

    if (!orgOfIdentity) {
      this.error = new Error(
        `identity's organization [${this.identity.mspId}] does not exist in the connection profile.`
      );
      return;
    }

    for (const [channelName, channel] of Object.entries(
      this.connectionProfile.channels
    )) {
      // Get the peers belonging to the identity's org
      const peers: string[] = [];
      for (const peer of Object.keys(channel.peers)) {
        if (orgOfIdentity.peers.includes(peer)) {
          peers.push(peer);
        }
      }

      if (peers.length) {
        this.channels.push(channelName);
      }
    }

    if (!this.channels.length) {
      this.error = new Error(
        `identity's organization [${this.identity.mspId}] does not have peers in any channel.`
      );
    }

    if (this.channels.length === 1) {
      this.channelIdx = 0;
    }
  }

  @Watch("connectionProfile")
  onConnectionProfileChange() {
    this.refreshChannels();
  }
  @Watch("identity")
  onIdentityChange() {
    this.refreshChannels();
  }

  @Watch("value")
  onValueChange(value: any) {
    if (value === null) {
      this.channelIdx = null;
    }
  }

  @Watch("channelIdx")
  onChannelIdxChange() {
    if (this.channelIdx != null && this.channelIdx! >= 0) {
      this.$emit("input", this.channels[this.channelIdx!]);
    } else {
      this.$emit("input", null);
    }
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
