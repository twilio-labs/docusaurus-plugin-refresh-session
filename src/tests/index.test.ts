import { HtmlTagObject, HtmlTags, LoadContext } from "@docusaurus/types";
import plugin, { PluginOptions } from "../index";

describe("docusaurus-plugin-refresh-session", () => {
  test("getClientModules returns the client script", () => {
    process.env.NODE_ENV = "production";
    const result = plugin({} as unknown as LoadContext, {});
    expect(
      result.getClientModules ? result.getClientModules() : undefined
    ).toEqual(["./refresh-session"]);
  });

  test("injectHtmlTags injects the redirectUrl correctly, if not specified", () => {
    process.env.NODE_ENV = "production";
    const result = plugin({} as unknown as LoadContext, {});
    const headTags: HtmlTags | undefined = result.injectHtmlTags
      ? result.injectHtmlTags({ content: null })?.headTags
      : undefined;

    expect(
      (headTags as HtmlTagObject[])?.[0]?.innerHTML?.includes(
        `window.docusaurusPluginRefreshSession = { redirectUrl: "" };`
      )
    ).toBeTruthy();
  });

  test("injectHtmlTags injects the redirectUrl correctly", () => {
    process.env.NODE_ENV = "production";
    const result = plugin({} as unknown as LoadContext, { redirectUrl: "foo" });
    const headTags: HtmlTags | undefined = result.injectHtmlTags
      ? result.injectHtmlTags({ content: null })?.headTags
      : undefined;

    expect(
      (headTags as HtmlTagObject[])?.[0]?.innerHTML?.includes(
        `window.docusaurusPluginRefreshSession = { redirectUrl: "foo" };`
      )
    ).toBeTruthy();
  });
});
