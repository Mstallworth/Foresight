export type QuickTake = {
  one_line: string;
  bullets: string[];
  confidence: 'low' | 'med' | 'high';
  assumptions: string[];
};

export type Cone = {
  name: 'Upside' | 'Downside';
  vignette: string;
  drivers: string[];
  uncertainties: string[];
  early_signals: string[];
};

export type SignalsDrivers = {
  signals: { title: string; summary: string; source_url: string | null }[];
  drivers: { name: string; why: string }[];
};

export type Timeline = {
  milestones: { when: string; what: string; so_what: string }[];
  inflections?: { when: string; what: string }[];
};

export type Moves = {
  no_regrets: string[];
  options: string[];
  watch_outs: string[];
  tags?: { effort?: 'L' | 'M' | 'H'; impact?: 'L' | 'M' | 'H' }[];
};

export type Artifacts = {
  quick_take: QuickTake;
  cones: Cone[];
  signals_drivers: SignalsDrivers;
  timeline: Timeline;
  moves: Moves;
};

export type GeneratePayload = {
  question: string;
  horizon?: 6 | 24 | 60;
  location?: string | null;
  perspective?: 'me' | 'we' | 'community';
  seed_bias?: 'conservative' | 'exploratory';
};
