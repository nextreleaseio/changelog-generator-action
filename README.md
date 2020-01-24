# Next Release Changelog Generator Action

**WARNING:** This is pre-release, experimental software that should only be used by those with adventurous spirits.

This Github action will automatically populate a Changelog with the details from your release body.

This is built by the team at [Next Release](https://www.nextrelease.io), but will work with any process that creates a release.

## Quick Start

```yml
on:
  release:
    types: [published]
jobs:
  generate_changelog:
    runs-on: ubuntu-latest # Configure this based on your needs
    name: Update Changelog
    steps:
      - name: Create Changelog.md
        id: changelog
        uses: nextrelease/changelog-generator-action@master
        with:
          token: ${{ secrets.GITHUB_TOKEN }} # Required
          changelog: "CHANGELOG.md" # optional, default: CHANGELOG.md
          use_pullrequest: true # can be false is you don't enable branch protection
          branch_name: ${{ join('changelog-', github.release.tag_name) }} # if `use_pullrequest` is true, will use this as default
```

## How It Works

This action works by reading the release generated by Next Release to generate a changelog in your repository.

**NOTE: This _will_ create a new commit in your repository!**

## Configuration Options

`token`: You must explicitly provide your `${{ secretes.GITHUB_TOKEN }}` for this action to access your repository.

`changelog`: This specificies the path and filename (relative to the project root) of your changelog. The default is `CHANGELOG.md`.
