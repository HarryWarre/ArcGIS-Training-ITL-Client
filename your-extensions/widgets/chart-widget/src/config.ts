import { type ImmutableObject } from 'seamless-immutable'

export interface Config {
  outfieldsSetting: string
}

export type IMConfig = ImmutableObject<Config>
