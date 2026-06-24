# Release process

## One-time npm bootstrap

npm Trusted Publishing can only be configured after the package exists. To keep
`1.0.0-beta.1` as the first real release with OIDC provenance:

1. Create the `@healock` npm organization and require 2FA for maintainers.
2. From a temporary directory outside this repository, publish a minimal
   `@healock/neumorphism-ui@0.0.0-bootstrap.0` package with the `bootstrap`
   dist-tag using an interactive maintainer account and OTP.
3. In the npm package settings, configure a GitHub Actions trusted publisher:
   - owner or organization: `Healock`
   - repository: `Neumorphism-UI`
   - workflow filename: `release.yml`
   - environment: `npm`
   - allowed action: `npm publish`
4. Verify the GitHub `npm` environment has the intended reviewer protection.
5. Publish the GitHub release for `v1.0.0-beta.1`. The release workflow runs all
   gates and publishes through OIDC. No npm token is required.
6. After the first OIDC publish succeeds, disallow token-based publishing in npm
   package settings and deprecate the bootstrap version.

## Normal releases

1. Add a Changeset describing the public change.
2. Run `pnpm version-packages` and review the generated version/changelog edits.
3. Run the same local checks as CI:

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm test:e2e
   pnpm build
   pnpm pack:check
   pnpm test:consumer
   ```

4. Merge the release changes to `main`.
5. Create and publish the matching GitHub release. npm provenance is generated
   automatically by Trusted Publishing for this public repository and package.

Do not place a long-lived npm publish token in repository or environment
secrets.
