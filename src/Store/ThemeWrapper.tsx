import { useEffect, useState } from "react";
import { initialize, Event } from "@harnessio/ff-javascript-client-sdk";

const SDK_KEY = "670c420d-6085-442c-9276-840800fa8122";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<string>("default");

  useEffect(() => {
    const cf = initialize(
      SDK_KEY,
      { identifier: "theme_variation", attributes: { lastUpdated: Date(), host: window.location.href } },
      { baseUrl: "https://config.ff.harness.io/api/1.0", eventUrl: "https://events.ff.harness.io/api/1.0" }
    );

    cf.on(Event.READY, (flags: Record<string, unknown>) => {
      const themeValue = flags.theme_variation;
      if (typeof themeValue === "string") {
        setTheme(themeValue);
      }
    });

    cf.on(Event.CHANGED, (flagInfo) => {
      if (flagInfo.flag === "theme_variation" && typeof flagInfo.value === "string") {
        setTheme(flagInfo.value);
      }
    });

    return () => {
      cf?.close();
    };
  }, []);

  return <div className={`app-container ${theme}`}>{children}</div>;
}

export default ThemeWrapper;
