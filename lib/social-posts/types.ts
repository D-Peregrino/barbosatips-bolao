export type SocialPostAccent = "green" | "red" | "amber" | "violet" | "gold" | "neutral";

export type SocialPostBundle = {
  id: string;
  label: string;
  accent: SocialPostAccent;
  preview: {
    title: string;
    subtitle: string;
    badge?: string;
  };
  instagram: string;
  telegram: string;
  twitter: string;
  hashtags: string;
};

export type SocialLinks = {
  site: string;
  picks: string;
  performance: string;
  telegram: string;
  youtube: string;
  instagram: string;
};
