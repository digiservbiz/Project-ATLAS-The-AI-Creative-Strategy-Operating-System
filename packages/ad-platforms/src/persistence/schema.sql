CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE ad_accounts (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  platform TEXT NOT NULL,
  external_account_id TEXT NOT NULL,
  currency TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (organization_id, platform, external_account_id)
);

CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  account_id TEXT NOT NULL REFERENCES ad_accounts(id),
  platform TEXT NOT NULL,
  external_campaign_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  objective TEXT,
  daily_budget REAL,
  currency TEXT,
  raw_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (organization_id, platform, external_campaign_id)
);

CREATE TABLE ad_sets (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  account_id TEXT NOT NULL REFERENCES ad_accounts(id),
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  platform TEXT NOT NULL,
  external_ad_set_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  targeting_json TEXT,
  raw_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (organization_id, platform, external_ad_set_id)
);

CREATE TABLE ads (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  account_id TEXT NOT NULL REFERENCES ad_accounts(id),
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  ad_set_id TEXT REFERENCES ad_sets(id),
  platform TEXT NOT NULL,
  external_ad_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  creative_id TEXT,
  raw_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (organization_id, platform, external_ad_id)
);

CREATE TABLE creatives (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  account_id TEXT NOT NULL REFERENCES ad_accounts(id),
  platform TEXT NOT NULL,
  external_creative_id TEXT NOT NULL,
  name TEXT,
  primary_text TEXT,
  headline TEXT,
  description TEXT,
  media_urls_json TEXT,
  landing_page_url TEXT,
  raw_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (organization_id, platform, external_creative_id)
);

CREATE TABLE performance_snapshots (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  platform TEXT NOT NULL,
  campaign_external_id TEXT NOT NULL,
  ad_external_id TEXT,
  timestamp TEXT NOT NULL,
  impressions REAL,
  clicks REAL,
  spend REAL,
  conversions REAL,
  revenue REAL,
  raw_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX idx_ad_sets_campaign ON ad_sets(campaign_id);
CREATE INDEX idx_ads_campaign ON ads(campaign_id);
CREATE INDEX idx_creatives_org ON creatives(organization_id);
CREATE INDEX idx_performance_campaign_time ON performance_snapshots(organization_id, campaign_external_id, timestamp);
