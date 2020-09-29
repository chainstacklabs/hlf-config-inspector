export interface OrganizationMSP {
  name: string; // Must be same as `msp_id`
  msp_id: string; // Must be same as `name`
  display_name: string;

  /** List of admins certificates as PEM (base64) */
  admins: string[];
  /** List of root CA certificates as PEM (base64) */
  root_certs: string[];
  /** List of intermediate CA certificates as PEM (base64) */
  intermediate_certs: string[];
  /** List of root TLS CA certificates as PEM (base64) */
  tls_root_certs: string[];
  /** List of intermediate TLS CA certificates as PEM (base64) */
  tls_intermediate_certs: string[];

  /** Node OUs */
  fabric_node_ous?: {
    enable: boolean;
    admin_ou_identifier?: {
      certificate: string;
      organizational_unit_identifier: string;
    };
    client_ou_identifier?: {
      certificate: string;
      organizational_unit_identifier: string;
    };
    orderer_ou_identifier?: {
      certificate: string;
      organizational_unit_identifier: string;
    };
    peer_ou_identifier?: {
      certificate: string;
      organizational_unit_identifier: string;
    };
  };
}

export default interface Organization {
  color: string;

  /** Organization MSP */
  msp: OrganizationMSP;
}
