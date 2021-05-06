/**
 * 1. read cli args
 * 2. check for gitignore (find-up)
 * 3. if gitignore doesn't exist then create it (unless --skip-create)
 * 4. if exists, then check if it includes patterns
 * 5. if includes patterns then exit (unless --force-with-comment)
 * 6. add the gitignore patterns (with/if --comment)
 */

import { readFileSync, writeFileSync } from 'fs';
import findUp from 'find-up';
import meow from 'meow';

const cli = meow(`
     Usage
       $ ignore-check -p <pattern>
       
     Options
       -p, --pattern=<gitignore pattern entry> (multiple) The patterns that need to present in the .gitignore
       -d, --cwd=<directory>  Working directory, if not set, it will automatically try to find .gitignore files in parent directories recursively.
       -c, --comment=<comment> The comment you want surrounding the added lines.
       -f, --force Forces the creationg of a .gitignore in the current directory if one does not   exist already or cannot be found while checking parent directories.
       -s, --silent Silences all logs.
       --dry-run Does not change any files, just outputs logs.

     Example
       $ npx ignore-check -p '**.data.json' -p dist -p '**.ignore.**'  --comment 'managed by open-wa'
 `, {
    flags: {
        cwd: {
            type: 'string',
            alias: 'd',
        },
        comment: {
            type: 'string',
            alias: 'c',
        },
        dryRun: {
            type: 'boolean',
            default: false
        },
        force: {
            type: 'boolean',
            alias: 'f',
            default: false
        },
        silent: {
            type: 'boolean',
            alias: 's',
            default: false
        },
        pattern: {
            type: 'string',
            isMultiple: true,
            isRequired: true,
            alias: 'p',
        }
    }
});


export const start = async () => {
    const log = (s : string) => cli.flags.silent ?  {} : console.log(`\n***.GITIGNORE CHECK***\n\n${s}\n\n***\n`)
    
    if(process.env["SKIP_GITIGNORE_CHECK"]) {
        log('Skipping .gitignore check. "SKIP_GITIGNORE_CHECK" environment variable was found.')
        return;
    }
    
    if (cli.flags.pattern.length === 0) {
        console.error('Specify at least one pattern');
        process.exit(1);
    }
    const patterns = cli.flags.pattern

    let filePath = findUp.sync('.gitignore');

    if(!filePath && cli.flags.force) {
        log(`.gitignore not found. Forcing creation at ./.gitignore`)
        filePath = './.gitignore'
        await writeFileSync(filePath, '');
    }

    if (filePath) {
        /**
         * Read file
         */
        const contents = (await readFileSync(filePath)).toString();
        const rawPatterns = contents
            .trim()
            .split(/\r?\n/)
        let missingPatterns = patterns.filter(pattern => !rawPatterns.includes(pattern))
        if (missingPatterns.length > 0) {
            //write to .gitignore
            const toWrite = `${[
                ...rawPatterns,
                cli.flags.comment ? `\n# ${cli.flags.comment}` : null,
                ...missingPatterns,
                cli.flags.comment ? `# end ${cli.flags.comment}` : null,
            ]
                .filter(x => x)
                .join('\n')
                .trim()}\n`
            if (!cli?.flags?.dryRun)
                await writeFileSync(filePath, toWrite);
            log(`Successfully added missing patterns to .gitignore (${filePath}): \n\t- ${missingPatterns.join('\n\t- ')}`)
        } else {
            log(`Patterns (${patterns.join(', ')}) already present in .gitignore (${filePath})`)
        }
        process.exit(0);
    } else {
        log(`.gitignore not found. Skipping ignore-check...`)
        process.exit(1);
    }
}

// start()