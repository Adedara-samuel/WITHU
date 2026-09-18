import { Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

export async function getBiometricAvailability() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
  const types = hasHardware ? await LocalAuthentication.supportedAuthenticationTypesAsync() : [];
  return { hasHardware, isEnrolled, available: hasHardware && isEnrolled, types };
}

/** A short, platform-appropriate label for whatever biometric method the device actually has. */
export function biometricLabel(types: LocalAuthentication.AuthenticationType[]): string {
  const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
  const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
  if (Platform.OS === "ios") return hasFace ? "Face ID" : "Touch ID";
  if (hasFace && hasFingerprint) return "Face or fingerprint unlock";
  if (hasFace) return "Face unlock";
  return "Fingerprint";
}
