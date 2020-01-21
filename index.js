const path = require("path");
const readJson = require("read-package-json");
const spawn = require("cross-spawn");

function bumpDeps(opts) {
  /* Parse options */
  const only = normalizeMode(findRemove(opts, "--only"));
  const bumpExact = findRemove(opts, "--bump-exact");
  const bumpOwnScope = !findRemove(opts, "--no-bump-own-scope");
  const scopes = filterOut(opts, opt => opt.startsWith("@"));
  const depsInScopes = deps =>
    Object.keys(deps).filter(dep =>
      scopes.some(scope => dep.startsWith(scope + "/"))
    );
  filterOut(opts, opt => {
    if (!opt.startsWith("-")) {
      console.warn(`Warning: Unacceptable option '${opt}'.`);
      return true;
    }
  });
  /* Determine scopes */
  if (bumpOwnScope) {
    const ownScope = extractScope();
    ownScope && scopes.push(ownScope);
  }
  if (scopes.length === 0) {
    console.warn("Warning: No scopes specified, exiting.");
    return;
  }
  /* Determine dependencies to update */
  readJson(path.resolve("package.json"), console.error, false, (er, pkg) => {
    if (er) {
      throw er;
    }
    const { dependencies = {}, devDependencies = {} } = pkg;
    let deps = [
      ...(only === "dev" ? [] : depsInScopes(dependencies)),
      ...(only === "prod" ? [] : depsInScopes(devDependencies))
    ];
    if (bumpExact) {
      deps = deps.map(dep => `${dep}@${process.env.npm_package_version}`);
    }
    if (deps.length > 0) {
      console.log(`Updating ${deps.join(", ")} ..`);
      spawn.sync("npm", ["install", ...opts, ...deps], {
        stdio: "inherit"
      });
    } else {
      console.log(`No dependencies to update (scope ${scopes.join(", ")}).`);
    }
  });
}

function normalizeMode(mode = "") {
  switch (mode) {
    case "development":
      return "dev";
    case "production":
      return "prod";
    default:
      return mode;
  }
}

function extractScope(pkgName = process.env.npm_package_name) {
  if (pkgName && pkgName.startsWith("@")) {
    return pkgName.substring(0, pkgName.indexOf("/"));
  }
  return "";
}

function filterOut(arr, pred) {
  const filtered = [];
  for (let i = arr.length - 1; i >= 0; --i) {
    pred(arr[i]) && filtered.push(arr.splice(i, 1)[0]);
  }
  return filtered;
}

/**
 * .
 * @param {[string]} arr options
 * @param {string} key option
 * @returns {string|true|null} option's value if present, `true` if flag is present, `null` if missing
 */
function findRemove(arr, key) {
  const ix = arr.findIndex(item => item == key || item.startsWith(key + "="));
  if (ix < 0) return null;
  const item = arr.splice(ix, 1)[0];
  const eqIx = item.indexOf("=");
  return eqIx < 0 ? true : item.slice(eqIx + 1);
}

module.exports = {
  bumpDeps,
  extractScope
};
