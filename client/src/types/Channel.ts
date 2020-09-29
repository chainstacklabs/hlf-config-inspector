export enum ChannelType {
  Application = "Application",
  System = "System"
}

export default interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  rawConfig: {
    channel_group: any;
    sequence: string;
  };
}
