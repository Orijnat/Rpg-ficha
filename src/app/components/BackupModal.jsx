"use client";

import SettingsModal from "./SettingsModal";

export default function BackupModal(props) {
  return <SettingsModal {...props} initialTab="backup" />;
}
