import type { ContentScriptContext } from "#imports";
import "~/assets/tailwind.css";
import App from "~/entrypoints/content/App.vue";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const ui = await createUi(ctx);
    ui.mount();
  },
});

function createUi(ctx: ContentScriptContext) {
  return createShadowRootUi(ctx, {
    name: "abei-translator",
    position: "inline",
    anchor: "body",
    onMount: (uiContainer) => {
      const app = createApp(App);
      app.mount(uiContainer);
      return app;
    },
    onRemove: (app) => {
      app?.unmount();
    },
  });
}
