import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { notification } from "antd";
import { Provider } from "react-redux";
import GlobalLoadingBar from "@/components/common/GlobalLoadingBar";
import { store } from "@/store/store";

notification.config({
  placement: "topRight",
  duration: 4.5,
  maxCount: 3,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <>
        <GlobalLoadingBar />
        <Component {...pageProps} />
      </>
    </Provider>
  );
}
