<template>
  <v-dialog v-model="dialogOpen" max-width="1200px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ title }} MSP</span>
      </v-card-title>
      <v-card-text v-if="msp.tlsCaCert && msp.caCert">
        <v-row>
          <v-col cols="12" sm="4">
            <h3>
              Signed Cert:
            </h3>
            <div class="my-3">
              <div>File path:</div>
              <code>{{ msp.signCert.filepath }}</code>
              <div class="mt-2">Serial number:</div>
              <code>{{ signCert.serialNumber }}</code>
            </div>
            <v-card outlined>
              <v-card-title>Subjects</v-card-title>
              <v-list>
                <v-list-item
                  two-line
                  v-for="(subject, i) in getCertSubject(signCert)"
                  :key="i"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ subject.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ subject.value }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <h3>Certificate Authority:</h3>
            <div class="my-3">
              <div>File path:</div>
              <code>{{ msp.caCert.filepath }}</code>
              <div class="mt-2">Serial number:</div>
              <code>{{ caCert.serialNumber }}</code>
            </div>
            <v-card outlined>
              <v-card-title>Subjects</v-card-title>
              <v-list>
                <v-list-item
                  two-line
                  v-for="(subject, i) in getCertSubject(caCert)"
                  :key="i"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ subject.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ subject.value }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <h3>TLS Certificate Authority:</h3>
            <div class="my-3">
              <div>File path:</div>
              <code>{{ msp.tlsCaCert.filepath }}</code>
              <div class="mt-2">Serial number:</div>
              <code>{{ tlsCaCert.serialNumber }}</code>
            </div>
            <v-card outlined>
              <v-card-title>Subjects</v-card-title>
              <v-list>
                <v-list-item
                  two-line
                  v-for="(subject, i) in getCertSubject(tlsCaCert)"
                  :key="i"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ subject.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ subject.value }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-if="msp.configFile">
          <v-col cols="12" sm="8" offset-sm="2">
            <div>Config file:</div>
            <code class="mt-3" style="width: 100%">{{ configFile }}</code>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
// Types
import { Component, Prop, Vue } from "vue-property-decorator";

import { Certificate } from "@fidm/x509";
import { IdentityMSP } from "@/types/Identity";

@Component
export default class IdentityMSPDialog extends Vue {
  private dialogOpen = false;
  private caCert: Certificate | null;
  private tlsCaCert: Certificate | null;
  private signCert: Certificate | null;
  private configFile?: string | null;

  @Prop({ required: true }) msp: IdentityMSP | undefined;
  @Prop() title: string | undefined;

  constructor() {
    super();

    if (!this.msp) {
      throw Error('"msp" is required');
    }

    this.caCert = IdentityMSPDialog._getCertFromPEMFileContent(
      this.msp.caCert.content
    );
    this.tlsCaCert = IdentityMSPDialog._getCertFromPEMFileContent(
      this.msp.tlsCaCert.content
    );
    this.signCert = IdentityMSPDialog._getCertFromPEMFileContent(
      this.msp.signCert.content
    );
    if (this.msp.configFile) {
      this.configFile = IdentityMSPDialog._bufferFromFileContent(
        this.msp.configFile.content
      ).toString();
    }
  }

  static _bufferFromFileContent(fileContent: string) {
    return Buffer.from(fileContent, "base64");
  }

  static _getCertFromPEMFileContent(fileContent: string) {
    try {
      return Certificate.fromPEM(this._bufferFromFileContent(fileContent));
    } catch {
      return null;
    }
  }

  showDialog() {
    this.dialogOpen = true;
  }

  getCertSubject(cert: Certificate) {
    return cert.subject.attributes.map(attr => ({
      shortName: attr.shortName,
      value: attr.value,
      name: attr.name
    }));
  }
}
</script>

<style scoped>
.theme--dark code {
  background-color: black;
  color: lightskyblue;
}
</style>
