import { Joi } from "@docusaurus/utils-validation";
import type {
  LoadContext,
  Plugin,
  OptionValidationContext,
} from "@docusaurus/types";
import type { PluginOptions, Options } from "./options";

export default function pluginSegment(
  context: LoadContext,
  { redirectUrl }: PluginOptions
): Plugin {
  return {
    name: "docusaurus-plugin-refresh-session",

    getClientModules() {
      return ["./refresh-session"];
    },

    injectHtmlTags() {
      redirectUrl = redirectUrl ?? "";
      return {
        headTags: [
          {
            tagName: "script",
            innerHTML: `window.docusaurusPluginRefreshSession = { redirectUrl: "${redirectUrl}" };`,
          },
        ],
      };
    },
  };
}

const pluginOptionsSchema = Joi.object<PluginOptions>({
  redirectUrl: Joi.string().default(""),
});

export function validateOptions({
  validate,
  options,
}: OptionValidationContext<Options, PluginOptions>): PluginOptions {
  return validate(pluginOptionsSchema, options);
}

export type { PluginOptions, Options };
