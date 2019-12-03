# Next Release Changelog Generator Action

**WARNING:** This is pre-release, experimental software that should only be used by those with adventurous spirits.

This Github action will automatically populate a Changelog with the details from your release body.

This is built by the team at [Next Release](https://www.nextrelease.io), but will work with any process that creates a release.

## Quick Start

This workflow will get you up and running quickly. TL

```yml
on:
  release:
    types: [published]
jobs:
  generate_changelog:
    runs-on: ubuntu-latest
    name: Update Changelog
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Create Changelog.md
        id: changelog
        uses: nextreleaase/next-release-changelog-action@master
        with:
          token: ${{ secrets.GITHUB_TOKEN }} # Required
          changelog: 'CHANGELOG.md' # optional, default: CHANGELOG.md
```
