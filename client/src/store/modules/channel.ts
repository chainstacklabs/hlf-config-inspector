import {
  action,
  createModule,
  extractVuexModule,
  mutation
} from "vuex-class-component";

import Channel, { ChannelType } from "@/types/Channel.new";

const VuexModule = createModule({
  namespaced: "channel"
});

export class ChannelStore extends VuexModule {
  private channel: Channel | null = null;

  get getChannel() {
    return this.channel;
  }

  @action
  async setChannel({
    name,
    channelType,
    channelRawConfig
  }: {
    name: string;
    channelType: ChannelType;
    channelRawConfig: any;
  }) {
    // TODO: Implement check for duplicate

    this.SET_CHANNEL({
      name,
      type: channelType,
      rawConfig: channelRawConfig
    });

    return this.channel;
  }

  @mutation
  private SET_CHANNEL(channel: Channel) {
    this.channel = channel;
  }
}

export default extractVuexModule(ChannelStore);
