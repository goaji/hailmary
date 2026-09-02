// Controlled vocabulary for article `tags`. 
export const TAG_IDS = ["playoffs", "super-bowl"] as const;

export type Tag = (typeof TAG_IDS)[number];
