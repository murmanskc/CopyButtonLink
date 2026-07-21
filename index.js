import { patcher, metro } from "@vendetta";
import { showToast } from "@vendetta/ui/toasts";
import { clipboard } from "@vendetta/metro/common";

let unpatches = [];

export default {
  onLoad: () => {
    const ButtonModule = metro.findByProps("Button", "ButtonColors") || metro.findByName("Button");

    if (!ButtonModule) {
      showToast("Copy Button Link: Component not found");
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
          clipboard.setString(targetUrl);
          showToast("Copied button link!");
        };
      }
    });

    unpatches.push(unpatch);
  },

  onUnload: () => {
    for (const unpatch of unpatches) {
      unpatch();
    }
    unpatches = [];
  }
};
