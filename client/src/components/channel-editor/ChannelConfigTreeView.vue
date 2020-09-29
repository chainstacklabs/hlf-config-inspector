<template>
  <div>
    <v-treeview
      ref="treeview"
      :items="[formattedChannel]"
      open-on-click
      item-key="path"
      transition
      :open="open"
      activatable
      @update:active="activeVal => updateActive(activeVal)"
      :active.sync="active"
    >
      <template v-slot:prepend="{ item, open, leaf }">
        <div v-if="!leaf">
          <v-icon v-if="isOrg(item)">
            mdi-bank
          </v-icon>
          <v-icon v-else>
            {{ open ? "mdi-folder-open" : "mdi-folder" }}
          </v-icon>
        </div>
        <div v-else-if="item.type">
          <v-icon v-if="item.type === 'policy'">
            mdi-file-account
          </v-icon>
          <v-icon v-else-if="item.type === 'value'">
            mdi-file-code
          </v-icon>
          <v-icon v-else-if="item.type === 'mod_policy'">
            mdi-file-document-edit
          </v-icon>
        </div>
      </template>
      <template v-slot:label="{ item }">
        <div v-if="item.path === 'channel_group'">
          Channel <em>({{ channel.name }})</em>
        </div>
        <div v-else>
          {{ item.name }}
        </div>
      </template>
    </v-treeview>
  </div>
</template>

<script lang="ts">
// Types
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import Channel from "@/types/Channel.new";

// Utils
import { getChannelTree } from "@/utils/channel";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import set from "lodash/set";

// Components
import ChannelConfigEditor from "./ChannelConfigEditor.vue";

interface Item {
  name: string;
  path: string;
}

@Component({
  components: {
    JsonEditor: () => import("@/components/ui/VueJsonEditor.vue")
  }
})
export default class ChannelConfigTreeView extends Vue {
  private readonly channelRawConfig: any;
  private formattedChannel: any;

  private active: string[] = [];
  private open = [
    "channel_group",
    "channel_group.groups",
    "channel_group.groups.Application",
    "channel_group.groups.Application.groups",
    "channel_group.groups.Consortiums",
    "channel_group.groups.Consortiums.groups",
    "channel_group.groups.Orderer",
    "channel_group.groups.Orderer.groups"
  ];

  private activeNode: { content: any; path: string } | null = null;

  private errorSnackbar: {
    open: Boolean;
    title?: String;
    text?: String;
  } = {
    open: false
  };

  private editorComponentRef!: ChannelConfigEditor;

  @Prop({ required: true }) private readonly channel!: Channel;

  constructor() {
    super();

    this.channelRawConfig = cloneDeep(this.channel.rawConfig);
    this.formattedChannel = getChannelTree(this.channelRawConfig);
  }

  setEditorComponentRef(component: ChannelConfigEditor) {
    this.editorComponentRef = component;
  }

  unselectActive() {
    this.active = [];
  }

  @Watch("activeNode")
  onActiveNodeChange() {
    if (this.activeNode) {
      const title = this.activeNode.path
        .replace("channel_group", "Channel")
        .replace(/\.groups\./g, "/")
        .replace(/\.values\./g, "/")
        .replace(/\./g, "/");

      this.editorComponentRef.openPanel(
        title,
        this.activeNode.path,
        this.getContentAtPath(this.activeNode.path)
      );
    } else {
      this.editorComponentRef.closePanel();
    }
  }

  getOrgMSPId(item: Item): string | null {
    const org = get(this.channelRawConfig, `${item.path}.values.MSP`);
    if (org) {
      return org.value.config.name;
    } else {
      return null;
    }
  }

  isOrg(item: Item) {
    return !!this.getOrgMSPId(item);
  }

  getContentAtPath(path: string) {
    return get(this.channelRawConfig, path);
  }

  updateActive(active: any[]) {
    if (active.length > 0) {
      this.activeNode = {
        content: get(this.channelRawConfig, active[0]),
        path: active[0]
      };
    } else {
      this.activeNode = null;
    }
  }

  openEditor(path: string) {
    if (this.activeNode && this.activeNode.path === path) {
      this.activeNode = null;
    } else {
      this.active = [path];
      this.activeNode = {
        content: this.getContentAtPath(path),
        path
      };
    }
  }
}
</script>

<style lang="scss">
.theme--dark .v-treeview-node--active .v-treeview-node__label {
  color: var(--v-primary-lighten2) !important;
}

.channel-editor .banner > .v-banner__wrapper {
  border-bottom: 0;
}
</style>
