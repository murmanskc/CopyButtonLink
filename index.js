(() => {
  let unpatches = [];

  return {
    onLoad: () => {
      try {
        // Safe global mod API lookup
        const v = window.vendetta || window.bunny || window.kettu || (typeof vendetta !== "undefined" ? vendetta : null);
        if (!v) return;

        const patcher = v.patcher;
        const metro = v.metro;
        const toasts = v.ui?.toasts;
        const clipboard = v.metro?.common?.clipboard;

        if (!patcher || !metro) return;

        // Search for Discord's Button module with multiple fallbacks
        const ButtonModule = metro.findByProps("Button", "ButtonColors") || 
                             metro.findByName("Button", false) || 
                             metro.findByProps("ButtonColors");

        if (!ButtonModule) {
          if (toasts?.showToast) toasts.showToast("Copy Button Link: Button module not found.");
          return;
        }

        const patchMethod = ButtonModule.default ? "default" : "render";

        const unpatch = patcher.after(patchMethod, ButtonModule, (args, res) => {
          try {
            const props = args[0];
            const targetUrl = props?.url || props?.component?.url;

            if (targetUrl && res?.props) {
              const originalLongPress = res.props.onLongPress;

              res.props.onLongPress = (e) => {
                if (typeof originalLongPress === "function") {
                  originalLongPress(e);
                }
                if (clipboard?.setString) {
                  clipboard.setString(targetUrl);
                }
                if (toasts?.showToast) {
                  toasts.showToast("Copied button link!");
                }
              };
            }
          } catch (patchErr) {
            console.error("[CopyButtonLink] Patch error:", patchErr);
          }
        });

        if (unpatch) unpatches.push(unpatch);
      } catch (err) {
        console.error("[CopyButtonLink] onLoad error:", err);
      }
    },

    onUnload: () => {
      for (const unpatch of unpatches) {
        if (typeof unpatch === "function") {
          try { unpatch(); } catch (_) {}
        }
      }
      unpatches = [];
    }
  };
})();
