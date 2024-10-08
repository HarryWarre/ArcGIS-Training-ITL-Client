import { type ImmutableObject } from "seamless-immutable";

export interface Config {
  collumnSetting: string;
}

export type IMConfig = ImmutableObject<Config>;
