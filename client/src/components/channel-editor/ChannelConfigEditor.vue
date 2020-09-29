<template>
  <v-card class="ma-0 fill-height d-flex flex-column">
    <v-card-title class="py-3 ">
      <span class="subtitle-1 font-weight-regular" v-text="title" />
      <v-spacer />
      <v-btn icon @click="closePanel()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text class="card-text pb-4">
      <div class="fill-height" ref="jsonEditorContainer">
        <json-editor
          v-model="content"
          :options="{
            mode: 'code',
            mainMenuBar: false
          }"
          :aceOptions="{
            fontSize: '16px'
          }"
          :height="`${jsonEditorHeight}px`"
          :readOnly="true"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
// Types
import { Vue, Component, Ref, Watch } from "vue-property-decorator";
// Components
import ChannelConfigTreeView from "./ChannelConfigTreeView.vue";

@Component({
  components: {
    JsonEditor: () => import("@/components/ui/VueJsonEditor.vue")
  }
})
export default class ChannelConfigEditor extends Vue {
  private title = "";
  private path: string | null = null;
  private originalContent: any = null;
  private content: any = null;

  private jsonEditorHeight = 0;

  private treeViewComponentRef!: ChannelConfigTreeView;

  @Ref() private jsonEditorContainer!: HTMLElement;

  setTreeViewComponentRef(component: ChannelConfigTreeView) {
    this.treeViewComponentRef = component;
  }

  @Watch("path")
  onPathChanged() {
    this.originalContent = this.content;
  }

  openPanel(title: string, path: string, content: any) {
    this.title = title;
    this.path = path;
    this.content = content;

    this.$nextTick(() => {
      this.jsonEditorHeight = this.jsonEditorContainer.clientHeight;
    });

    this.$emit("openPanel");
  }
  closePanel() {
    this.treeViewComponentRef.unselectActive();
    this.path = null;
    this.content = null;
    this.$emit("closePanel");
  }
}
</script>

<style scoped lang="scss">
.card-text {
  flex: 1 1 auto;
  height: 0;
  overflow-y: auto;
}
</style>
