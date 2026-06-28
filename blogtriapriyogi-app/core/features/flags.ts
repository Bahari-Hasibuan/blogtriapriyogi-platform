export const features = {
  ai_writer: true,
  analytics_realtime: true,
  custom_domain: true,
  api_access: false,
  enterprise_api: false
}

export function isFeatureEnabled(key: keyof typeof features) {
  return features[key]
}
