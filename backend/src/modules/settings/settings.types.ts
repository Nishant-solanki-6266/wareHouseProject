export interface SettingItem {
  key: string;
  value: Record<string, unknown>;
  description?: string | null;
}
