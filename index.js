(() => {
  const v = window.vendetta || window.bunny || {};
  const patcher = v.patcher;
  const metro = v.metro;
  const showToast = v.ui?.toasts?.showToast || console.log;
  const clipboard = v.metro?.common?.clipboard;

  let unpatches = [];

  return {
    onLoad: () => {
      if (!metro || !patcher) {
        showToast("Error: Mod APIs not accessible.");
        return;
      }

      const ButtonModule = metro.findByProps("Button", "ButtonColors") || metro.findByName("Button");

      if (!ButtonModule) {
        showToast("Copy Button Link: Button component not found.");
        return;
      }

      const unpatch = patcher.after("default", ButtonModule, (args, res) => {
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
            showToast("Copied button link!");
          };
        }
      });

      unpatches.push(unpatch);
    },

    onUnload: () => {
      for (const unpatch of unpatches) {
        if (typeof unpatch === "function") unpatch();
      }
      unpatches = [];
    }
  };
})();
