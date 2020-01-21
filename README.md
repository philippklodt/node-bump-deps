# bump-deps

## Manage dependencies by scope

## Typical usage (CI setting)

Your project and some of its dependencies live in a custom npm scope:

```json
// package.json
{
  "name": "@your-corp/your-app",
  "version": "1.0.0",
  ...
  "dependencies": {
    "@your-corp/your-library": "^1.0.0",
    "@your-corp/another-library": "^1.0.0",
    // other dependencies
    "is-number": "^7.0.0"
    ...
  },
  "devDependencies": {
    "@your-corp/your-tool": "^1.0.0",
    "bump-deps": "*"
    ...
  },
  "scripts": {
    // run after you bump your package, but before a git tag and commit
    "version": "bump-deps"
    ...
  },
```

Now you release a new version of your project by running `npm version minor`.
Maybe there are new versions of some of your company-wide dependencies and you want to use the latest versions while keeping versions of external dependencies locked.

This is what `bump-deps` run as an npm `version` lifecycle script does.

## Options

While the above is a typical usecase, the options allow for some customization and fine-tuning.

### Pass-through options

`bump-deps` calls `npm install` internally on the matching packages. Just pass any `install`-options, they will be passed through:

```sh
npx bump-deps --package-lock-only --no-audit
```

_Note:_ The proper `bump-dep` options start with `bump-` to minimize the risk of name clashes with current or future npm options.

### Different scopes

You can pass arbitrary number of scopes to update (besides your package's own scope) by specifying them as options:

```sh
npx bump-deps @some-scope @another-scope // --... other options
```

If you do not want the package's own scope to be updated:

```sh
npx bump-deps @some-scope --no-bump-own-scope
```

### Development and production

If you want only the production `dependencies` or only the `devDependencies` to be bumped, use the `--only` option (the syntax is equivalent to [the npm option of the same name](https://docs.npmjs.com/misc/config#only)).

### Simultaneous versioning (`--bump-exact`)

If all of your scoped dependencies are versioned simultaneously, the standard script as above still works fine as long as the semver ranges of your dependencies include the new version.

If they don't (for example you are bumping to a new prerelease version), you can still update all your scoped packages to that version by running `bump-deps --bump-exact`.

_As `--bump-exact` only really makes sense when doing simultaneous versioning, it will bump all matching dependencies to the project's version._

### What about peer dependencies?

Updating peer dependencies is different than updating regular dependencies. Actually it always implies a breaking change in your library (see [this discussion](https://github.com/semver/semver/issues/502) for example).

_Therefore automatic updating of peer dependencies is purposely not supported._
