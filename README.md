# Projek Asia Cordova Android App

## Versions

* Cordova: 6.0.0
* Ionic: ~1.7.0
* Node: 4.2.1

## Install

* `npm install`
* `ionic state restore` or `ionic state reset`

## Commands

* `npm run start` - Start a dev server, pointing to dev api endpoints, and serving assets with ionic.
* `npm run staging` - Run a remote staging server suitable ionic web server. Builds with dev api endpoints.
* `npm run start-staging` - Initial startup script for a remote staging server. Works together with staging.json config.
* `build` - generate a dev build of the web assets. Uses development config vars.
* `build-production` - generate a production ready build of the web assets. Used mainly to ensure production config vars are used instead of dev values.
* `npm run serve-production` - Start a dev server, pointing to production api endpoints, and serving assets with ionic. Be careful!

## Run

* `npm start` will run an ionic server and serve the app in the browser.
* Use the ionic cli (`ionic -h`) for all else.

## Deploy staging

* `cp staging.example.json staging.json`
* Ensure proper config
* Before a post-deploy hook can properly work, you must first start the script manually via:
  * pm2 deploy staging.json production exec 'npm run staging-staging'
* `pm2 deploy staging.json production`

## Build for Debug
* `git pull` to get latest source
* `npm install`
* `gulp`
* `ionic build`

## Building different platforms
https://crosswalk-project.org/documentation/cordova/cordova_4.html

## Build for Release
* taken from http://ionicframework.com/docs/guide/publishing.html

* `npm run build-production` will ensure that all production environment variables are in place.
* we probably don’t want the debug console plugin enabled, so we should remove it before generating the release builds:
* `ionic plugin rm cordova-plugin-console`
* `ionic build --release android`  // This will generate a release build based on the settings in your config.xml
* If needed bump your build / version number in config.xml
* To sign the unsigned APK, run the jarsigner tool which is also included in the JDK:
* `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore Example-release-unsigned.apk alias_name`
* `zipalign -v 4 Example-release-unsigned.apk Example.apk`
* Now we have our final release binary called Example.apk and we can release this on the Google Play Store
