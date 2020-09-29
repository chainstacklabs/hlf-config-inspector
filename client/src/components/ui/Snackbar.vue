<template>
  <v-snackbar
    v-model="internalValue"
    class="v-snackbar--ui"
    v-bind="{
      ...$attrs,
      timeout: Number(this.timeout),
      color: 'transparent'
    }"
  >
    <v-alert
      class="v-alert--ui ma-0"
      dark
      v-bind="$attrs"
      v-on="$listeners"
      :type="type"
      :dismissible="dismissible"
    >
      <template v-if="$attrs.icon" v-slot:prepend>
        <v-icon
          class="v-alert__icon elevation-6 white"
          light
          :color="$attrs.color"
        >
          {{ $attrs.icon }}
        </v-icon>
      </template>

      <slot />

      <template v-if="dismissible" v-slot:close="{ toggle }">
        <v-btn icon small @click="toggle">
          <v-icon>
            $vuetify.icons.cancel
          </v-icon>
        </v-btn>
      </template>
    </v-alert>
  </v-snackbar>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

@Component
export default class Snackbar extends Vue {
  @Prop({ default: true }) dismissible!: boolean;
  @Prop({ default: "" }) type!: string;
  @Prop() value!: boolean;
  @Prop() timeout?: string;

  private internalValue: boolean;

  constructor() {
    super();
    this.internalValue = this.value;
  }

  @Watch("internalValue")
  onInternalValueChanged(val: boolean, oldVal: boolean) {
    if (val === oldVal) return;

    this.$emit("input", val);
  }

  @Watch("value")
  onValueChanged(val: boolean, oldVal: boolean) {
    if (val === oldVal) return;

    this.internalValue = val;
  }
}
</script>

<style lang="scss">
.v-snackbar--ui {
  margin-top: 32px;
  margin-bottom: 32px;

  .v-alert.v-alert--ui {
    width: 100%;
  }

  .v-alert--ui,
  .v-snack__wrapper {
    border-radius: 4px;
  }
  .v-snack__content {
    overflow: visible;
    padding: 0;
  }
}
</style>
