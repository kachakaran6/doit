fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android internal

```sh
[bundle exec] fastlane android internal
```

Autoincrement version & build, compile release AAB, and upload to Google Play Internal testing track

### android closed

```sh
[bundle exec] fastlane android closed
```

Autoincrement version & build, compile release AAB, and upload to Google Play Closed testing (alpha) track

### android deploy_both

```sh
[bundle exec] fastlane android deploy_both
```

Autoincrement version & build, compile AAB, and deploy to BOTH Google Play Internal and Closed tracks

### android promote_to_closed

```sh
[bundle exec] fastlane android promote_to_closed
```

Promote latest release from Internal track to Closed Testing (alpha) track without rebuilding

### android production

```sh
[bundle exec] fastlane android production
```

Upload Flutter release bundle to Google Play Production track

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
