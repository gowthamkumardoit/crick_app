export type ContentType =
  | "BROADCAST"
  | "POPUP"
  | "CAROUSEL";

export interface ContentItem {
  contentId: string;
  type: ContentType;
  title: string;
  body?: string;
  startAt: number;
  endAt?: number;
  dismissible: boolean;
}
