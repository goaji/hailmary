// Controlled vocabulary for article `tags`. 
export const TAG_IDS = ["playoffs", "super-bowl", "intrebari", "bulletpoints"] as const;

export type Tag = (typeof TAG_IDS)[number];
