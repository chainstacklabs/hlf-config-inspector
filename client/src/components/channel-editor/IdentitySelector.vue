<template>
  <div>
    <v-list two-line>
      <v-subheader v-if="identities.length">Choose an identity</v-subheader>
      <v-list-item-group v-model="identityIdx" color="primary">
        <v-list-item v-for="(identity, i) in identities" :key="i">
          <v-list-item-content>
            <v-list-item-title>
              {{ identity.name }} ({{ identity.mspId }})
            </v-list-item-title>
            <v-list-item-subtitle>
              <subjects :subjects="identity.subjects" />
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
      <v-subheader>Import a new identiy</v-subheader>
      <v-list-item>
        <v-btn color="primary" @click="importIdentityDialog.showDialog()">
          <v-icon class="mr-2">mdi-account-plus</v-icon>
          Import
        </v-btn>
      </v-list-item>
    </v-list>
    <import-identity-dialog ref="importIdentityDialog" />
  </div>
</template>

<script lang="ts">
// Types
import { Vue, Component, Prop, Watch, Ref } from "vue-property-decorator";
import { ids } from "@/store";
// Components
import ImportIdentityDialog from "@/components/dialogs/ImportIdentity.vue";

@Component({
  components: {
    Subjects: () => import("@/components/Subjects.vue"),
    ImportIdentityDialog
  }
})
export default class IdentitySelector extends Vue {
  private identityIdx: number | null = null;

  get identities() {
    return ids.all;
  }

  @Prop({ required: true }) value!: any;

  @Watch("value")
  onValueChange(value: any) {
    if (value === null) {
      this.identityIdx = null;
    }
  }

  @Watch("identityIdx")
  onIdentityIdxChange() {
    if (this.identityIdx != null && this.identityIdx! >= 0) {
      this.$emit("input", this.identities[this.identityIdx!]);
    } else {
      this.$emit("input", null);
    }
  }

  @Ref("importIdentityDialog") importIdentityDialog!: ImportIdentityDialog;
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
