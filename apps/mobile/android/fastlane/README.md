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

Build signed AAB, upload to Google Play Internal track, and archive in Git

### android closed

```sh
[bundle exec] fastlane android closed
```

Build signed AAB, upload to Google Play Closed track, and archive in Git

### android beta

```sh
[bundle exec] fastlane android beta
```

Build signed AAB, upload to Google Play Beta track, and archive in Git

### android production

```sh
[bundle exec] fastlane android production
```

Build signed AAB, upload to Google Play Production track, and archive in Git

### android promote_to_closed

```sh
[bundle exec] fastlane android promote_to_closed
```

Promote latest release from Internal track to Closed Testing track

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
