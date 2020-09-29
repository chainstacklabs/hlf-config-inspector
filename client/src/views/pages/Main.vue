<template>
  <v-container class="fill-height pa-0" fluid>
    <particles-bg
      v-if="ready && bgAnimation"
      type="cobweb"
      class="particle-bg"
      :num="bgNumDots"
      :canvas="{ backgroundColor: $vuetify.theme.dark ? '#333333' : '#dddddd' }"
      :color="$vuetify.theme.dark ? '#bbbbbb' : '#333333'"
      :bg="true"
    />
    <channel-editor />
  </v-container>
</template>

<script lang="ts">
// Types
import { Vue, Component, Watch } from "vue-property-decorator";
// Components
// @ts-ignore
import { ParticlesBg } from "particles-bg-vue";
import ChannelEditor from "@/components/channel-editor/Main.vue";
// Store
import { settings } from "@/store";

@Component({
  components: {
    ChannelEditor,
    ParticlesBg
  }
})
export default class Main extends Vue {
  ready = true;
  bgAnimation = true;

  get bgNumDots() {
    switch (this.$vuetify.breakpoint.name) {
      case "xs":
        return "10";
      case "sm":
        return "25";
      case "md":
        return "50";
      case "lg":
        return "100";
      case "xl":
        return "150";
    }
  }

  get bgAnimationSetting() {
    return settings.bgAnimation;
  }

  @Watch("bgAnimationSetting", { immediate: true })
  onBgAnimationSettingChange() {
    this.bgAnimation = settings.bgAnimation;
  }

  @Watch("$vuetify.theme.dark")
  onChange() {
    // Hack to force particle-bg to reload
    this.ready = false;
    this.$nextTick(() => {
      this.ready = true;
    });
  }
}
</script>

<style scoped lang="scss">
.particle-bg {
  z-index: 0 !important;
}
</style>
