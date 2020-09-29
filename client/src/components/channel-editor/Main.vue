<template>
  <v-row align="center" justify="center" class="fill-height">
    <v-col cols="6" xl="5" offset-xl="1" class="fill-height pa-12 pr-0">
      <v-card
        class="elevation-12 d-flex flex-column fill-height ma-0 left-panel"
      >
        <v-card-title class="pa-0">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>
              Hyperledger Fabric Channel Config Inspector
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon large class="my-1" @click="settingsDialog.showDialog()">
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </v-toolbar>
        </v-card-title>
        <v-card-text class="pa-0" v-if="!channel">
          <v-stepper v-model="step">
            <v-stepper-items>
              <v-stepper-content step="1" class="pa-0">
                <connection-profile-selector v-model="profile" />
              </v-stepper-content>
              <v-stepper-content step="2" class="pa-0">
                <identity-selector v-model="identity" />
              </v-stepper-content>
              <v-stepper-content step="3" class="pa-0">
                <channel-selector
                  v-model="channelName"
                  :connection-profile="profile"
                  :identity="identity"
                />
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-card-text>
        <v-spacer v-if="!channel" />
        <v-card-text v-if="channel" class="pa-0 channel-editor">
          <channel-config-tree-view
            ref="channelConfigTreeView"
            :channel="channel"
          />
        </v-card-text>
        <v-card-actions class="pa-4" v-if="!channel">
          <v-spacer></v-spacer>
          <v-btn
            @click="step = step - 1"
            :disabled="loading"
            v-if="step > 1"
            class="mr-2"
            text
          >
            Previous
          </v-btn>
          <v-btn
            color="primary"
            @click="nextAction()"
            :loading="loading"
            :disabled="!isStepValid(step)"
          >
            {{ nextButtonText(step) }}
          </v-btn>
        </v-card-actions>
        <v-card-actions class="pa-4" v-else>
          <v-btn @click="reset()" class="mr-2">
            Select Another Channel
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="6" xl="5" class="fill-height pa-12 pl-0">
      <div class="py-12 ma-0 fill-height right-panel">
        <transition name="slide">
          <div class="fill-height" v-show="showEditorPanel">
            <channel-config-editor
              ref="channelConfigEditor"
              @openPanel="showEditorPanel = true"
              @closePanel="showEditorPanel = false"
            />
          </div>
        </transition>
      </div>
    </v-col>
    <v-col cols="0" xl="1" class="pa-0" />

    <v-snackbar v-model="errorSnackbar.open" :multi-line="true" timeout="5000">
      An error occured: {{ errorSnackbar.text }}
    </v-snackbar>

    <settings-dialog ref="settingsDialog" />
  </v-row>
</template>

<script lang="ts">
// Types
import { Component, Ref, Vue, Watch } from "vue-property-decorator";
import ConnectionProfile from "@/types/ConnectionProfile";
import Identity from "@/types/Identity.v2";
import Channel, { ChannelType } from "@/types/Channel.new";

// Store
import { channel as channelStore } from "@/store";
import { dicoverChannelConfig, fetchChannelConfig } from "@/api/peer.v2";

// Components
import ConnectionProfileSelector from "./ConnectionProfileSelector.vue";
import IdentitySelector from "./IdentitySelector.vue";
import ChannelSelector from "./ChannelSelector.vue";
import ChannelConfigTreeView from "./ChannelConfigTreeView.vue";
import ChannelConfigEditor from "./ChannelConfigEditor.vue";
import SettingsDialog from "@/components/dialogs/Settings.vue";

// Utils
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";

// API
import { getConfigUpdateEnvelope } from "@/api/configtxlator";

@Component({
  components: {
    ConnectionProfileSelector,
    IdentitySelector,
    ChannelSelector,
    ChannelConfigTreeView,
    ChannelConfigEditor,
    SettingsDialog
  }
})
export default class Main extends Vue {
  private step = 1;

  private profile: ConnectionProfile | null = null;
  private identity: Identity | null = null;
  private channelName: string | null = null;

  private loading = false;

  private channel: Channel | null = null;

  private showEditorPanel = false;

  private updateProcess: {
    loading: boolean;
    update: any;
    error: Error | null;
    envelopePB: string;
  } = {
    loading: false,
    update: null,
    error: null,
    envelopePB: ""
  };

  private errorSnackbar: {
    open: Boolean;
    text?: String;
  } = {
    open: false
  };

  constructor() {
    super();

    window.addEventListener("keydown", e => {
      if (e.key === "Enter" && this.isStepValid()) {
        this.nextAction();
      }
    });

    // TODO: Have a better way to select current channel (if any)
    if (channelStore.getChannel) {
      this.channel = channelStore.getChannel;
    }
  }

  @Watch("channel", { immediate: true })
  onChannelChange() {
    if (this.channel) {
      // Link conig tree and editor components
      this.$nextTick(() => {
        this.channelConfigEditor.setTreeViewComponentRef(
          this.channelConfigTreeView
        );
        this.channelConfigTreeView.setEditorComponentRef(
          this.channelConfigEditor
        );
      });
    }
  }

  @Watch("profile")
  onProfileChange() {
    this.identity = null;
    this.channelName = null;
  }

  @Watch("identity")
  onIdentityChange() {
    this.channelName = null;
  }

  @Ref() channelConfigTreeView!: ChannelConfigTreeView;
  @Ref() channelConfigEditor!: ChannelConfigEditor;
  @Ref() settingsDialog!: SettingsDialog;

  isStepValid() {
    switch (this.step) {
      case 1:
        return !!this.profile;
      case 2:
        return !!this.identity;
      case 3:
        return !!this.channelName;
      default:
        return false;
    }
  }

  nextButtonText() {
    switch (this.step) {
      case 3:
        return "Load";
      default:
        return "Next";
    }
  }

  async nextAction() {
    if (this.step < 3) {
      this.step = this.step + 1;
      return;
    }

    switch (this.step) {
      case 3:
        this.loading = true;
        await this.loadChannelConfig();
        break;
      default:
        this.step = this.step + 1;
        break;
    }
  }

  async loadChannelConfig() {
    let peer = null;

    let msps: Record<string, { root_certs: string[] }> = {};
    let error: Error | null = null;

    for (const _peer of Object.values(this.profile!.peers)) {
      try {
        const result = await dicoverChannelConfig(
          _peer,
          this.identity!,
          this.channelName!
        );
        msps = result.msps;
        peer = _peer;
        break;
      } catch (e) {
        error = e;
      }
    }

    if (error) {
      // TODO Better handle
      this.errorSnackbar.open = true;
      this.errorSnackbar.text = error.message;
      this.loading = false;

      throw error;
    }

    if (!Object.keys(msps).includes(this.identity!.mspId)) {
      // TODO Better handle
      throw new Error("MSP Id not found");
    }

    const orgRootCerts = msps[this.identity!.mspId].root_certs;

    const channelConfig = await fetchChannelConfig(
      peer!,
      this.identity!,
      orgRootCerts,
      this.channelName!
    );

    this.channel = await channelStore.setChannel({
      name: this.channelName!,
      channelType: ChannelType.Application,
      channelRawConfig: channelConfig
    });

    this.loading = false;
  }

  reset() {
    this.profile = null;
    this.identity = null;
    this.channel = null;
    this.step = 1;
    this.showEditorPanel = false;
  }
}
</script>

<style scoped lang="scss">
.v-card__title {
  overflow: hidden;
}

.v-stepper {
  box-shadow: none;
  background: transparent;
}

.v-list-item--active {
  color: white;
  background-color: var(--v-primary-base);
}

.channel-editor {
  flex: 1 1 auto;
  height: 0;
  overflow-y: scroll;
}

.left-panel {
  z-index: 1;
}
.right-panel {
  .slide-enter-active {
    transition: all 0.2s ease-out;
  }
  .slide-leave-active {
    transition: all 0.3s ease-out;
  }
  .slide-enter,
  .slide-leave-to {
    opacity: 0;
    transform: translateX(-500px) !important;
  }

  .v-card {
    transform: translateX(-5px);
    padding-left: 5px;
  }
}
</style>
