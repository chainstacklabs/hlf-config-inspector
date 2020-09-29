import {
  action,
  createModule,
  extractVuexModule,
  mutation
} from "vuex-class-component";
import * as uuid from "uuid";

import { ApplicationChannel } from "@/types/Channel.v2";

const VuexModule = createModule({
  namespaced: "application-channels"
});

export class ApplicationChannelsStore extends VuexModule {
  private items: ApplicationChannel[] = [];

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
  async addChannel(channel: ApplicationChannel) {
    // TODO: Implement check for duplicate

    this.ADD_CHANNEL({
      ...channel,
      id: uuid.v4()
    });
  }

  @action
  async updateChannel(channel: ApplicationChannel) {
    this.UPDATE_CHANNEL({
      ...channel
    });
  }

  @mutation
  private ADD_CHANNEL(channel: ApplicationChannel) {
    this.items.push({ ...channel });
  }

  @mutation
  private UPDATE_CHANNEL(channel: ApplicationChannel) {
    const index = this.items.findIndex(c => c.id === channel.id);
    if (index > -1) {
      this.items.splice(index, 1, channel);
    }
  }
}

export default extractVuexModule(ApplicationChannelsStore);
