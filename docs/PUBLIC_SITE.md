# Public website publishing

The private repository remains the source of truth. The public repository
`sl0ld/tahder-site-public` contains only the static marketing website generated
by:

```powershell
npm run site:build-public
```

The build uses an explicit allow-list. It intentionally excludes the mobile
application, browser extension, Supabase migrations, Edge Functions, and
curriculum files.

The public copy includes the browser-safe Supabase anonymous key used by the
website. Never add a secret key or a service-role key to `extension-site`.

## Automatic publishing

The workflow `.github/workflows/publish-public-site.yml` can publish the safe
copy from the private repository. Add a private repository secret named
`PUBLIC_SITE_TOKEN` with permission to update the public repository, then run
the workflow manually from GitHub Actions.
