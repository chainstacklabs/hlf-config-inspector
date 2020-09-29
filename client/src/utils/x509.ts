import { Certificate, PrivateKey } from "@fidm/x509";

export function subjectsFromCertBase64(certContent: string) {
  const cert = Certificate.fromPEM(Buffer.from(certContent, "base64"));

  const subjects: Record<string, string> = {};
  for (const { shortName, value } of cert.subject.attributes) {
    subjects[shortName] = value;
  }

  return subjects;
}

export function checkPrivateKeyWithCert(
  keyContent: string,
  certContent: string
) {
  try {
    const privateKey = PrivateKey.fromPEM(Buffer.from(keyContent, "base64"));
    const cert = Certificate.fromPEM(Buffer.from(certContent, "base64"));

    const data = Buffer.allocUnsafe(100);
    const signature = privateKey.sign(data, "sha256");
    return cert.publicKey.verify(data, signature, "sha256");
  } catch (e) {
    return false;
  }
}
