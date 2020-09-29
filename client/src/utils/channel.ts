import get from "lodash/get";

import Organization from "@/types/Organization";
import Channel from "@/types/Channel";

import { organizations } from "@/store";

export enum ChannelGroupName {
  Application = "Application",
  Orderer = "Orderer"
}

export function getChannelGroupOrgs(
  groupName: ChannelGroupName,
  channelRawConfig: any
): (Organization | string)[] {
  const orgs: Record<string, any> = get(channelRawConfig, [
    "channel_group",
    "groups",
    groupName,
    "groups"
  ]);

  return Object.values(orgs).map(orgRaw => {
    const orgMSP = get(orgRaw, ["values", "MSP", "value", "config"]);

    const org: Organization | undefined = organizations.byMSPId(orgMSP.name);

    // TODO: Handle not found
    return org ? org : orgMSP.name;
  });
}

export function getOrdererGroupEndpoints(channelRawConfig: any) {
  const orgs: Record<string, any> = get(channelRawConfig, [
    "channel_group",
    "groups",
    "Orderer",
    "groups"
  ]);

  return Object.values(orgs).map(orgRaw => {
    const orgMSP = get(orgRaw, ["values", "MSP", "value", "config"]);
    const endpoints = get(
      orgRaw,
      ["values", "Endpoints", "value", "addresses"],
      []
    );

    // TODO: Handle org not available in store
    const org: Organization | undefined = organizations.byMSPId(orgMSP.name);

    return {
      org: org ? org : orgMSP.name,
      endpoints
    };
  });
}

interface Config {
  name: string;
  children: Config[];
  policies: Record<string, any>;
  values: Record<string, any>;
}

function groupToTree(name: string, path: string, group: any): any {
  const groups = [];

  const groupGroups: Record<string, any> = group.groups;
  for (const [subgroupName, subgroupContent] of Object.entries(groupGroups)) {
    groups.push(
      groupToTree(
        subgroupName,
        `${path}.groups.${subgroupName}`,
        subgroupContent
      )
    );
  }

  const groupPolicies: Record<string, any> = group.policies;
  const policies: {
    name: string;
    type: string;
    path: string;
    policy: any;
  }[] = [];
  for (const [policyName, policyContent] of Object.entries(groupPolicies)) {
    policies.push({
      name: policyName,
      type: "policy",
      path: `${path}.policies.${policyName}`,
      policy: policyContent.policy.value
    });
  }

  const groupValues: Record<string, any> = group.values;
  const values: {
    name: string;
    type: string;
    path: string;
    value: any;
  }[] = [];
  for (const [valueName, valueContent] of Object.entries(groupValues)) {
    values.push({
      name: valueName,
      type: "value",
      path: `${path}.values.${valueName}`,
      value: valueContent.value
    });
  }

  let children: any[] = [];
  if (groups.length > 0) {
    children = [
      {
        name: "groups",
        path: `${path}.groups`,
        children: groups
      }
    ];
  }
  children = [
    ...children,
    {
      name: "mod_policy",
      type: "mod_policy",
      path: `${path}.mod_policy`
    },
    {
      name: "policies",
      path: `${path}.policies`,
      children: policies
    },
    {
      name: "values",
      path: `${path}.values`,
      children: values
    }
  ];

  return { name, path, children, version: group.version };
}

export function getChannelTree(channelConfig: { channel_group: any }): Config {
  return groupToTree("Channel", "channel_group", channelConfig.channel_group);
}
