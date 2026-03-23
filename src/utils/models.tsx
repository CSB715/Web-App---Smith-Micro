import type { Timestamp } from "firebase/firestore";

export type Device = {
  id: string;
  name: string;
};

export type Visit = {
  id: string;
  siteUrl: string;
  startDateTime: Date;
  endDateTime: Date;
};

export type Notification = {
  id: string;
  siteUrl: string;
  deviceName: string;
  reason: string;
  dateTime: Date;
};

export type Categorization = {
  siteUrl: string;
  category: string[];
  is_flagged: boolean;
};

export type Override = {
  category: string[];
  flagged_for: string[];
};

export type NotificationTrigger = {
  uid: string,
  name: string,
  devices: Device[],
  categories: string[],
  sites: string[],
  alertType: string,
  notifID: string,
  limit_hr: number,
  limit_min: number,
  email: boolean,
  text: boolean,
  days: string[],
  startTime: Timestamp,
  endTime: Timestamp,
}
