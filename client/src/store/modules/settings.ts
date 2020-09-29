import {
  createModule,
  mutation,
  action,
  extractVuexModule
} from "vuex-class-component";

const VuexModule = createModule({
  namespaced: "settings"
});

export class SettingsStore extends VuexModule {
  private _darkTheme: boolean | null = null;
  private _bgAnimation = false;

  constructor() {
    super();
  }

  get all() {
    return {
      darkTheme: this._darkTheme,
      bgAnimation: this._bgAnimation
    };
  }

  get darkTheme() {
    return this._darkTheme;
  }
  get bgAnimation() {
    return this._bgAnimation;
  }

  @action async setDarkTheme(val: boolean) {
    this.SET_DARK_THEME(val);
  }
  @action async setBgAnimation(val: boolean) {
    this.SET_BG_ANIMATION(val);
  }

  @mutation private SET_DARK_THEME(val: boolean) {
    this._darkTheme = val;
  }
  @mutation private SET_BG_ANIMATION(val: boolean) {
    this._bgAnimation = val;
  }
}

export default extractVuexModule(SettingsStore);
