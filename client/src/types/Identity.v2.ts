export default interface Identity {
  id: string;
  name: string;
  mspId: string;

  /** Private key as PEM (base64) */
  privateKey: string;
  /** Signed Certificate as PEM (base64) */
  signCert: string;
  /** Extracted from {@link signCert} Signed Certificate */
  subjects: Record<string, string>;
}
