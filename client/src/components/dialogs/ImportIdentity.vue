<template>
  <div>
    <v-dialog v-model="dialogOpen" max-width="800px" scrollable>
      <v-card>
        <v-card-title>
          <span class="headline">Import identity</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field v-model="name" label="Name" outlined required />
              <v-text-field v-model="mspId" label="MSP ID" outlined required />
              <div class="pb-0">
                <span class="display-1">
                  Private Key <small><em>(plain or base64)</em></small>
                </span>
                <v-textarea v-model="privateKey" outlined no-resize required />
              </div>
              <div class="pb-0">
                <span class="display-1">
                  Signed Certificate <small><em>(plain or base64)</em></small>
                </span>
                <v-textarea v-model="signCert" outlined no-resize required />
              </div>
              <div class="mb-4" v-if="Object.keys(subjects).length">
                <div><small>Certificate's subjects</small></div>
                <subjects class="text--primary" :subjects="subjects" />
              </div>
            </v-form>
          </v-container>
          <v-alert
            type="error"
            class="mx-3 mt-2"
            v-if="privateKey && signCert && !privateKeyAndSignCertValid"
          >
            Private key and signed certificate don't match
          </v-alert>
        </v-card-text>
        <v-card-actions class="pb-6 px-9">
          <v-spacer></v-spacer>
          <v-btn color="normal" text @click="hideDialog">Close</v-btn>
          <v-btn
            color="primary"
            @click="importIdentity()"
            :disabled="!isFormValid()"
          >
            Import
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <snackbar v-model="errorSnackbar.open" type="error" timeout="2000">
      <div class="font-weight-bold">Cannot import identity</div>
      <div>{{ errorSnackbar.text }}</div>
    </snackbar>
  </div>
</template>

<script lang="ts">
// Types
import { Component, Ref, Vue, Watch } from "vue-property-decorator";

// Utils
import { stringToBase64, base64ToString } from "@/utils/file";

// Store
import { ids, orgs } from "@/store";
import { checkPrivateKeyWithCert, subjectsFromCertBase64 } from "@/utils/x509";

@Component({
  components: {
    Snackbar: () => import("@/components/ui/Snackbar.vue"),
    Subjects: () => import("@/components/Subjects.vue")
  }
})
export default class ImportIdentity extends Vue {
  private dialogOpen = false;
  private valid = true;

  private name: string = "";
  private mspId: string = "";
  private privateKey: string = "";
  private signCert: string = "";

  private subjects: Record<string, string> = {};
  private privateKeyAndSignCertValid = false;

  private errorSnackbar: {
    open: Boolean;
    text?: String;
  } = {
    open: false
  };

  hideDialog() {
    this.dialogOpen = false;
  }
  showDialog() {
    this.dialogOpen = true;
  }

  @Ref() readonly form!: HTMLFormElement;

  @Watch("signCert")
  onSignCertChange() {
    if (this.signCert) {
      try {
        const singCertAsBase64 = this.signedCertFromInputToBase64();
        this.subjects = subjectsFromCertBase64(singCertAsBase64);
      } catch (e) {
        this.subjects = {};
      }
    } else {
      this.subjects = {};
    }

    this.checkPrivateKeyWitSignedCert();
  }

  @Watch("privateKey")
  onPrivateKeyChange() {
    this.checkPrivateKeyWitSignedCert();
  }

  privateKeyFromInputToBase64() {
    const base64Decode = base64ToString(this.privateKey);

    if (base64Decode.startsWith("-----BEGIN PRIVATE KEY-----")) {
      return this.privateKey;
    }
    return stringToBase64(this.privateKey);
  }

  signedCertFromInputToBase64() {
    const base64Decode = base64ToString(this.signCert);

    if (base64Decode.startsWith("-----BEGIN CERTIFICATE-----")) {
      return this.signCert;
    }
    return stringToBase64(this.signCert);
  }

  checkPrivateKeyWitSignedCert() {
    if (!this.privateKey || !this.signCert) {
      this.privateKeyAndSignCertValid = false;
      return;
    }

    const privateKeyAsBase64 = this.privateKeyFromInputToBase64();
    const singCertAsBase64 = this.signedCertFromInputToBase64();

    this.privateKeyAndSignCertValid = checkPrivateKeyWithCert(
      privateKeyAsBase64,
      singCertAsBase64
    );
  }

  isFormValid() {
    return (
      this.name &&
      this.mspId &&
      this.privateKey &&
      this.signCert &&
      this.privateKeyAndSignCertValid
    );
  }

  async importIdentity() {
    if (!this.form.validate()) {
      return;
    }

    try {
      const privateKeyAsBase64 = this.privateKeyFromInputToBase64();
      const singCertAsBase64 = this.signedCertFromInputToBase64();

      const subjects = subjectsFromCertBase64(singCertAsBase64);

      await ids.addIdentity({
        id: "0",
        name: this.name,
        mspId: this.mspId,
        privateKey: privateKeyAsBase64,
        signCert: singCertAsBase64,
        subjects
      });

      this.form.reset();
      this.hideDialog();
    } catch (e) {
      this.errorSnackbar.text = e.message;
      this.errorSnackbar.open = true;
    }
  }
}
</script>
