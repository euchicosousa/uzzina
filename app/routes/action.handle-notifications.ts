import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { INTENT } from "~/lib/CONSTANTS";
import { getUserId } from "~/services/auth.server";
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "~/models/notifications.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, user_id } = await getUserId(request);
  
  const [notifications, unreadCount] = await Promise.all([
    listNotifications(supabase, user_id),
    getUnreadCount(supabase, user_id),
  ]);

  return Response.json({ notifications, unreadCount });
};

interface NotificationPayload {
  intent?: string;
  notificationIds?: string[] | string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = (contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries(await request.formData())) as NotificationPayload;
  const { intent } = payload;

  const { supabase, user_id } = await getUserId(request);

  if (intent === INTENT.mark_notification_read) {
    let ids: string[] = [];
    if (payload.notificationIds) {
      if (Array.isArray(payload.notificationIds)) {
        ids = payload.notificationIds;
      } else if (typeof payload.notificationIds === "string") {
        try {
          ids = JSON.parse(payload.notificationIds);
        } catch {
          ids = [payload.notificationIds];
        }
      }
    }

    if (ids.length === 0) {
      return Response.json({ error: "Notification IDs are required" }, { status: 400 });
    }

    await markAsRead(supabase, ids, user_id);
    return Response.json({ success: true });
  } else if (intent === INTENT.mark_all_notifications_read) {
    await markAllAsRead(supabase, user_id);
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid intent" }, { status: 400 });
};
