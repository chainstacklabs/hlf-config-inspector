export enum ChannelType {
  Application = "Application",
  System = "System"
}

export default interface Channel {
  name: string;
  type: ChannelType;
  rawConfig: {
    channel_group: any;
    sequence: string;
  };
}
