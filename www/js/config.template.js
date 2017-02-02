angular.module('projek.constants', [])
  .constant('APP_CREDENTIALS', {
    APP_ID: $ENV_APP_ID,
    APP_KEY: $ENV_APP_KEY
  })

  .constant('LEGACY_API_BASE', $ENV_LEGACY_API_BASE)

  .constant('API_BASE', $ENV_API_BASE)

  .constant('GCM_SENDER_ID', $ENV_GCM_SENDER_ID)

  .constant('YOUTUBE_KEY', $ENV_YOUTUBE_KEY);
