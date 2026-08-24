import { notification } from "antd";

export type NoticeType = "success" | "sucess" | "info" | "warning" | "error";

export interface NotificationOptions {
  type?: NoticeType;
  title?: React.ReactNode;
  content?: React.ReactNode;
  duration?: number;
}

export function showNotification({
  type = "info",
  title = "Thông báo",
  content = "",
  duration = 4.5,
}: NotificationOptions) {
  const normalizedType = type === "sucess" ? "success" : type;

  notification[normalizedType]({
    title: title,
    description: content,
    duration,
    placement: "topRight",
  });
}

export default showNotification;
