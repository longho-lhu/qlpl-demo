import { useEffect, useState } from "react";
import { Progress, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function GlobalLoadingBar() {
  const [active, setActive] = useState(false);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const handleChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ active: boolean }>;
      const isActive = Boolean(customEvent.detail?.active);
      setActive(isActive);

      if (!isActive) {
        setPercent(100);
        const resetTimer = window.setTimeout(() => {
          setPercent(0);
        }, 250);
        return () => window.clearTimeout(resetTimer);
      }

      setPercent((current) => (current >= 90 ? 90 : current + 18));
    };

    const tick = window.setInterval(() => {
      if (active) {
        setPercent((current) => (current >= 90 ? 90 : current + 12));
      }
    }, 220);

    window.addEventListener("api-loading-change", handleChange);

    return () => {
      window.removeEventListener("api-loading-change", handleChange);
      window.clearInterval(tick);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[9999] h-[2px] overflow-hidden">
      <div className="mx-auto flex w-full max-w-[1600px] items-center gap-2 px-0">
        <div className="h-[2px] flex-1 overflow-hidden bg-transparent">
          <Progress
            percent={percent}
            showInfo={false}
            strokeColor="#2563eb"
            trailColor="transparent"
            size="small"
            status="active"
            strokeWidth={2}
          />
        </div>
        <Spin indicator={<LoadingOutlined spin style={{ fontSize: 12, color: "#2563eb" }} />} />
      </div>
    </div>
  );
}
