#!/usr/bin/env tsx
/**
 * importers — one-time CLI import harness for crate.social
 *
 * Usage:
 *   npm run cli -- rss <url> [--dry-run]
 *   npm run cli -- markdown <dir> [--dry-run]
 */
import { Command } from 'commander';

const program = new Command();

program
  .name('importers')
  .description('One-time import harness for crate.social. Writes social.crate.* records to your PDS.')
  .version('0.1.0');

program
  .command('rss <url>')
  .description('Import items from an RSS/Atom feed and write them as social.crate.* records.')
  .option('--dry-run', 'Parse and validate records without writing to PDS', false)
  .action(async (url: string, opts: { dryRun: boolean }) => {
    console.log(`TODO: rss adapter not yet implemented`);
    console.log(`  url:     ${url}`);
    console.log(`  dry-run: ${opts.dryRun}`);
    process.exit(0);
  });

program
  .command('markdown <dir>')
  .description('Import markdown files from a directory and write them as social.crate.note records.')
  .option('--dry-run', 'Parse and validate records without writing to PDS', false)
  .action(async (dir: string, opts: { dryRun: boolean }) => {
    console.log(`TODO: markdown adapter not yet implemented`);
    console.log(`  dir:     ${dir}`);
    console.log(`  dry-run: ${opts.dryRun}`);
    process.exit(0);
  });

program.parseAsync(process.argv);
