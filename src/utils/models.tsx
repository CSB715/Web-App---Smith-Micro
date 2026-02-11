export type Device = {
  id: string;
  name: string;
};

export type Visit = {
  siteUrl: string;
  startDateTime: Date;
};

export type Notification = {
  id: string;
  siteUrl: string;
  deviceName: string;
  reason: string;
  dateTime: Date;
};

export type Categorization = {
  categories: string[];
};

export type Override = {
  categories: string[];
  flaggedFor: string[];
};
