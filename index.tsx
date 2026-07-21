import { patcher, metro } from "@vendetta";
import { showToast } from "@vendetta/ui/toasts";
import { clipboard } from "@vendetta/metro/common";

let unpatches: (() => void)[] = [];

export default {
  onLoad: () => {
    // Find Discord's Button component module
    const ButtonModule = metro.findByProps("Button", "ButtonColors") || metro.findByName("Button");

    if (!ButtonModule) {
      showToast("Copy Button Link: Button module not found.");
      return;
    }

    // Patch the component renderer
    const unpatch = patcher.after("default", ButtonModule, (args, res) => {
      const props = args[0];
      // Check if button has a target URL attached (Direct prop or Component prop)
      const targetUrl = props?.url || props?.component?.url;

      if (targetUrl && res?.props) {
        const originalLongPress = res.props.onLongPress;

        // Intercept long press gesture
        res.props.onLongPress = (e: any) => {
          if (typeof originalLongPress === "function") {
            originalLongPress(e);
          }

          // Copy link and display confirmation toast
          clipboard.setString(targetUrl);
          showToast("Copied button link!");
        };
      }
    });

    unpatches.push(unpatch);
  },

  onUnload: () => {
    // Clean up patches when plugin is uninstalled/disabled
    for (const unpatch of unpatches) {
      unpatch();
    }
    unpatches = [];
  }
};
