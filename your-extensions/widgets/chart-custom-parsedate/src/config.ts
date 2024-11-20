import { type ImmutableObject } from "seamless-immutable";

// Cập nhật interface Config để bao gồm thuộc tính toggleEnabled
export interface Config {
  outfieldsSetting: string;
  toggleEnabled: boolean; // Thêm thuộc tính toggleEnabled
}

// Giữ nguyên IMConfig với thuộc tính mới
export type IMConfig = ImmutableObject<Config>;
