var CopyButtonLink = (function () {
  'use strict';

  var patcher = vendetta.patcher;
  var metro = vendetta.metro;
  var toasts = vendetta.ui.toasts;
  var common = vendetta.metro.common;

  var unpatches = [];

  return {
    onLoad: function () {
      var ButtonModule = metro.findByProps("Button", "ButtonColors") || metro.findByName("Button");

      if (!ButtonModule) {
        if (toasts && toasts.showToast) toasts.showToast("Copy Button Link: Component not found");
        return;
      }

      var unpatch = patcher.after("default", ButtonModule, function (args, res) {
        var props = args[0];
        var targetUrl = props && (props.url || (props.component && props.component.url));

        if (targetUrl && res && res.props) {
          var originalLongPress = res.props.onLongPress;

          res.props.onLongPress = function (e) {
            if (typeof originalLongPress === "function") {
              originalLongPress(e);
            }
            if (common && common.clipboard && common.clipboard.setString) {
              common.clipboard.setString(targetUrl);
            }
            if (toasts && toasts.showToast) {
              toasts.showToast("Copied button link!");
            }
          };
        }
      });

      unpatches.push(unpatch);
    },

    onUnload: function () {
      for (var i = 0; i < unpatches.length; i++) {
        if (typeof unpatches[i] === "function") unpatches[i]();
      }
      unpatches = [];
    }
  };
})();
