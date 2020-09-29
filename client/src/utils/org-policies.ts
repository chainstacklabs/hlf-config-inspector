export function getOrgApplicationDefaultPolicies(orgMSPId: string) {
  return {
    Readers: {
      Type: "Signature",
      Rule: `OR('${orgMSPId}.admin', '${orgMSPId}.peer', '${orgMSPId}.client')`
    },
    Writers: {
      Type: "Signature",
      Rule: `OR('${orgMSPId}.admin', '${orgMSPId}.client')`
    },
    Admins: {
      Type: "Signature",
      Rule: `OR('${orgMSPId}.admin')`
    },
    Endorsement: {
      Type: "Signature",
      Rule: `OR('${orgMSPId}.peer')`
    }
  };
}

export function getOrgOrdererDefaultPolicies(orgMSPId: string) {
  return {
    Readers: {
      Type: "Signature",
      Rule: `OR('${orgMSPId}.member')`
    },
    Writers: {
      Type: "Signature",
      Rule: `OR('${orgMSPId}.member')`
    },
    Admins: {
      Type: "Signature",
      Rule: `OR('${orgMSPId}.admin')`
    }
  };
}
