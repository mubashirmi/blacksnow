import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ANIMATION_DIR = path.join(ROOT, 'public', 'animations');
const SRC_DIR = path.join(ROOT, 'src');

const PURPLE = [67 / 255, 51 / 255, 175 / 255]; // #4333AF

const FILES = [
    'growthChartIcon.json',
    'affiliate-coin-dollar-blue.json',
    'dividendicon.json',
    'invoivecontracticon.json',
    'invoicecontractctaicon.json',
    'billboardherosection.json',
    'advretisingicon.json',
    'emailmarketing-herosection-page.json',
    'emailmarketingicon.json',
];

const ORIGINAL_BLUES = [
    [44, 125, 192],
    [48, 132, 195],
    [42, 139, 201],
];

function isBlue(color) {
    return (
        Array.isArray(color) &&
        color.length >= 3 &&
        color.slice(0, 3).every((n) => typeof n === 'number' && Number.isFinite(n)) &&
        ORIGINAL_BLUES.some((rgb) => rgb.every((n, i) => Math.abs(color[i] * 255 - n) < 1.5))
    );
}

function recolorKeyframes(value) {
    if (!Array.isArray(value)) return 0;

    if (isBlue(value)) {
        value.splice(0, 3, ...PURPLE);
        return 1;
    }

    let changed = 0;

    for (const item of value) {
        if (item && typeof item === 'object') {
            changed += recolorKeyframes(item.s);
            changed += recolorKeyframes(item.e);
        }
    }

    return changed;
}

function recolorAnimation(data) {
    let changed = 0;

    function walk(node) {
        if (!node || typeof node !== 'object') return;

        if (Array.isArray(node)) {
            node.forEach(walk);
            return;
        }

        if ((node.ty === 'fl' || node.ty === 'st') && node.c && 'k' in node.c) {
            changed += recolorKeyframes(node.c.k);
        }

        Object.values(node).forEach(walk);
    }

    walk(data);

    return changed;
}

async function findSourceFiles(dir) {
    const files = [];

    for (const entry of await readdir(dir, {
        withFileTypes: true,
    })) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...(await findSourceFiles(fullPath)));
        } else if (entry.isFile() && /\.(tsx?|jsx?)$/i.test(entry.name)) {
            files.push(fullPath);
        }
    }

    return files;
}

async function main() {
    const replacements = [];
    let updatedColors = 0;

    console.log('Updating Black Snow Lottie animations...\n');

    for (const filename of FILES) {
        const originalPath = path.join(ANIMATION_DIR, filename);

        try {
            const raw = await readFile(originalPath, 'utf8');
            const animation = JSON.parse(raw);

            const count = recolorAnimation(animation);
            updatedColors += count;

            const newFilename = filename.replace(/\.json$/i, '-purple-v2.json');

            await writeFile(path.join(ANIMATION_DIR, newFilename), JSON.stringify(animation), 'utf8');

            replacements.push([`/animations/${filename}`, `/animations/${newFilename}`]);

            console.log(`CREATED: ${newFilename} (${count} blue colors changed)`);
        } catch (error) {
            console.error(`ERROR: ${filename} - ${error.message}`);
        }
    }

    let updatedComponents = 0;

    const sourceFiles = await findSourceFiles(SRC_DIR);

    for (const file of sourceFiles) {
        const original = await readFile(file, 'utf8');
        let updated = original;

        for (const [oldPath, newPath] of replacements) {
            updated = updated.split(oldPath).join(newPath);
        }

        if (updated !== original) {
            await writeFile(file, updated, 'utf8');

            updatedComponents++;

            console.log(`UPDATED COMPONENT: ${path.relative(ROOT, file)}`);
        }
    }

    console.log('\nFinished!');
    console.log(`Animations processed: ${replacements.length}/9`);
    console.log(`Blue colors changed: ${updatedColors}`);
    console.log(`Components updated: ${updatedComponents}`);
    console.log('Original JSON files preserved.');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
