import { ENGAGEMENT_TYPE_OPTIONS, EngagementTypeOption, EngagementViewType } from '../models/store.model';

/**
 * Code-level feature flags. These are developer switches only and are never exposed in the UI.
 */
export const FEATURE_FLAGS = {
  // Store view analytics timeframes shown to store owners. Add 'daily', 'weekly' or 'monthly' to re-enable them.
  enabledEngagementTypes: ['lifetime'] as readonly EngagementViewType[],
  // "Simulate Store View (+1)" test button in the Profile analytics panel
  showViewSimulation: false
};

// Engagement options filtered by FEATURE_FLAGS.enabledEngagementTypes (falls back to Lifetime if none match)
export const ENABLED_ENGAGEMENT_TYPE_OPTIONS: EngagementTypeOption[] = (() => {
  const enabled = ENGAGEMENT_TYPE_OPTIONS.filter(o => FEATURE_FLAGS.enabledEngagementTypes.includes(o.type));
  return enabled.length > 0 ? enabled : ENGAGEMENT_TYPE_OPTIONS.filter(o => o.type === 'lifetime');
})();

// Default selected timeframe: the first enabled option
export const DEFAULT_ENGAGEMENT_TYPE: EngagementViewType = ENABLED_ENGAGEMENT_TYPE_OPTIONS[0]?.type ?? 'lifetime';
