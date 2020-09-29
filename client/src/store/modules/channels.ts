import {
  action,
  createModule,
  extractVuexModule,
  mutation
} from "vuex-class-component";
import * as uuid from "uuid";

import Channel, { ChannelType } from "@/types/Channel";

const VuexModule = createModule({
  namespaced: "channels"
});

export class ChannelsStore extends VuexModule {
  private items: Channel[] = [];

  get all() {
    return this.items;
  }

  get byName() {
    // TODO: Channel name is not unique !
    return (name: string) => {
      return this.items.find(channel => channel.name === name) || null;
    };
  }

  get byId() {
    return (id: string) => {
      return this.items.find(({ id: cid }) => cid === id) || null;
    };
  }

  @action
  async addChannel({
    name,
    channelType,
    channelRawConfig
  }: {
    name: string;
    channelType: ChannelType;
    channelRawConfig: any;
  }) {
    // TODO: Implement check for duplicate

    this.ADD_CHANNEL({
      name,
      id: uuid.v4(),
      type: channelType,
      rawConfig: channelRawConfig
    });
  }

  @action
  async updateChannel(channel: Channel) {
    this.UPDATE_CHANNEL({
      ...channel
    });
  }

  @mutation
  private ADD_CHANNEL(channel: Channel) {
    this.items.push({ ...channel });
  }

  @mutation
  private UPDATE_CHANNEL(channel: Channel) {
    const index = this.items.findIndex(c => c.id === channel.id);
    if (index > -1) {
      this.items.splice(index, 1, channel);
    }
  }
}

export default extractVuexModule(ChannelsStore);
