import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { notification } from "antd";
import GlobalLoadingBar from "@/components/common/GlobalLoadingBar";

notification.config({
  placement: "topRight",
  duration: 4.5,
  maxCount: 3,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalLoadingBar />
      <Component {...pageProps} />
    </>
  );
}
