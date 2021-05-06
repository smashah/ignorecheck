<div align="center">
<img src="https://raw.githubusercontent.com/smashah/ignorecheck/master/assets/ignore-check.png"/>

# ignore-check

> A simple CLI utility to make sure certain patterns are present in a project's .gitignore file.
>

[![npm version](https://img.shields.io/npm/v/ignore-check.svg?color=green)](https://www.npmjs.com/package/ignore-check)
[![Downloads](https://img.shields.io/npm/dm/ignore-check.svg)](https://www.npmjs.com/package/ignore-check)

</div>

## Install

```bash
> npm install --global ignore-check
```

or you can use npx to run it on the fly without installing it

```bash
> npx ignore-check
```

## Usage

```
$ npx ignore-check

  Usage
    $ ignore-check -p "**.data.json" -p "node_modules"

  Options
    -p, --pattern=<gitignore pattern entry> (multiple) The patterns that need to present in the .gitignore
    -d, --cwd=<directory>  Working directory, if not set, it will automatically try to find .gitignore files in parent directories recursively.
    -c, --comment=<comment> The comment you want surrounding the added lines.
    -f, --force Forces the creationg of a .gitignore in the current directory if one does not   exist already or cannot be found while checking parent directories.
    -s, --silent Silences all logs.
    --dry-run Does not change any files, just outputs logs.
```

## For library maintainers

If you are developing a library that has specific sensitive file formats, you can add this script to your package.json as an `install` command.

For example, in [open-wa](https://github.com/open-wa/wa-automate-nodejs), there is a super sensitive file which always ends with `.data.json`.

As the maintainer, I want to make sure that these files never get commited to repos and end up being leaked publicly. So I've added the following line to my package.json for that library.

```javascript
//package.json
{
    ...
    "scripts": {
        ...
        "install": "npm_config_yes=true npx ignore-check -p \"**data.json\" -f --comment \"managed by open-wa\""
        ...
    }
}
```

This will now result in the ignore-check running every time someone installs or updates the library via `npm`.

Your users can bypass this check by either:

1. Running `npm install your-lib` with the `--ignore-scripts` flag. The disadvantage of doing this is that it will ignore scripts from other dependencies also.
2. Set `SKIP_GITIGNORE_CHECK=true` as an environmental variable.

## Acknowledgements & Inspirations

- [ensure-gitignore](https://github.com/seek-oss/ensure-gitignore)
- [find-up](https://github.com/sindresorhus/find-up)

## License

ISC © [Mohammed Shah](https://github.com/smashah)