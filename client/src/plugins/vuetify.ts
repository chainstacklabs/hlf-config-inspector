import Vue from "vue";
// @ts-ignore
import Vuetify from "vuetify/lib";
import i18n from "@/i18n";
import "@/sass/overrides.sass";

Vue.use(Vuetify);

const theme = {
  primary: "#505F73",
  secondary: "#f34a47",
  accent: "#9C27b0",
  info: "#00CAE3"
};

const lang: any = {
  t: (key: any, ...params: any) => i18n.t(key, params)
};

// @ts-ignore
export default new Vuetify({
  lang,
  theme: {
    themes: {
      dark: theme,
      light: theme
    },
    options: {
      customProperties: true
    }
  }
});
