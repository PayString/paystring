# Contributing to PayID <!-- omit in toc -->

:tada: First off, thanks for taking the time to contribute! :tada:

The following is a set of guidelines for contributing to PayID and associated packages hosted in the [PayID Organization](https://github.com/payid-org)

- [Code of Conduct](#code-of-conduct)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
  - [Reporting Vulnerabilities](#reporting-vulnerabilities)
- [Pull Request Guidelines](#pull-request-guidelines)
  - [Adding New Features](#adding-new-features)
  - [Fixing Bugs](#fixing-bugs)
- [Versioning](#versioning)
- [Development Setup](#development-setup)
  - [Commonly Used NPM Scripts](#commonly-used-npm-scripts)

## Code of Conduct

<!-- TODO:(hbergren) Update this to the Code of Conduct on `payid-org` when it exists -->

This project and all participants are governed by the [PayID Code of Conduct](https://github.com/xpring-eng/.github/blob/master/CODE_OF_CONDUCT.md).

## Issue Reporting Guidelines

<!-- TODO:(hbergren) Update these links when we migrate to `payid-org`. -->

If you've found a bug or want to request a new feature, please [create a new issue](https://github.com/xpring-eng/payid/issues/new) or a [pull request](https://github.com/xpring-eng/payid/compare) on GitHub.

Please include as much detail as possible to help us properly address your issue. If we need to triage issues and constantly ask people for more detail, that's time taken away from actually fixing issues. Help us be as efficient as possible by including a lot of detail in your issues.

### Reporting Vulnerabilities

<!-- TODO:(hbergren) Update this link when we migrate to `payid-org` -->

If you have found a vulnerability, please read our [Vulnerability Disclosure Policy](https://github.com/xpring-eng/.github/blob/master/SECURITY.md) to learn how to responsibly report the vulnerability.

## Pull Request Guidelines

- We believe in small PRs. An ideal PR is <= 250 lines of code, so it can be easily reviewed.
- Not all functionality can fit in a 250 LoC PR. For those cases, we use [Stacked PRs](https://unhashable.com/stacked-pull-requests-keeping-github-diffs-small/). This lets each standalone slice of functionality be easily reviewed, while clearly showing the relationship between features. Writing small PRs in a stack also lets you get approval for important architecture/design decisions before writing 2000 lines of code of functionality based on your initial assumptions.
- All PRs should be made against the `master` branch, unless stacking.
- It's ok to have multiple small commits as you work on the PR - Github will automatically squash your commits before merging.

### Adding New Features

- Add accompanying test cases.
- Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before beginning work.

### Fixing Bugs

- Provide a detailed description of the bug in the PR.
- Add one or more regression tests.

## Versioning

<!-- TODO:(hbergren) Update the Github Releases link to `payid-org` when it exists -->
<!-- TODO:(hbergren) Add a link to the CHANGELOG when it exists. -->

The PayID reference implementation itself follows [Semantic Versioning](https://semver.org/), and this is the version that is referenced by [Github Releases](https://github.com/xpring-eng/payid/releases) and in the [package.json](./package.json) file.

The PayID Protocol itself is versioned in a `{major}.{minor}` version, and this will be referenced in the CHANGELOG and Github Releases where appropriate. In the codebase, the supported protocol versions live in [config.ts](./src/config.ts).

The RESTful CRUD API for interacting with PayIDs on the server is versioned as well, using a `YYYY-MM-DD` version, as many other RESTful APIs use for their version headers. This version will be referenced in the CHANGELOG and Github Releases where appropriate as well, and also lives in [config.ts](./src/config.ts).

## Development Setup

<!-- TODO:(hbergren) We should update this section once we have our Postgres Docker container. -->

You will need [NodeJS](https://nodejs.org/en/) v12 or higher, and [npm](https://www.npmjs.com/get-npm).

You will also need a local Postgres database running. The specifics can be set as environment variables read in [config.ts](./src/config.ts).

After cloning the repo, run:

```sh
$ npm install # To install dependencies of the project
```

### Commonly Used NPM Scripts

```sh
# Boot up the Node.js / Express PayID server locally
$ npm run start

# Run the full test suite
$ npm run test

# Lint the code, auto-fixing any auto-fixable problems
$ npm run lint
```

There are other scripts available in the `scripts` section of the [package.json](./package.json) file.
