import { StyleConfig } from "dist/widgets/arcgis/feature-info/src/config";
import { IconConfig } from "dist/widgets/common/button/src/config";
import { Expression, IconResult } from "jimu-core";
import { LinkParam } from "jimu-ui/advanced/setting-components";
import { type ImmutableObject } from "seamless-immutable";

export interface Config {
  exampleConfigProperty: string;
  functionConfig: FunctionConfig;
  styleConfig?: StyleConfig;
}

export interface FunctionConfig {
  toolTip?: string;
  text?: string;
  icon?: IconConfig;
  /**
   * customIcons is used for developers to set certain icons as preset icons, it could not be uploaded in the builder.
   * These custom icons can't be delete.
   */
  customIcons?: IconResult[];
  textExpression?: Expression;
  toolTipExpression?: Expression;
  linkParam?: LinkParam;
}

export type IMConfig = ImmutableObject<Config>;
