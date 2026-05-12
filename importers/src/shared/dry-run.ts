/**
 * --dry-run flag wiring.
 *
 * Each subcommand passes its dryRun boolean to this helper before any write.
 * In dry-run mode the importer parses, validates, and logs records without
 * touching the PDS or any local state files.
 */

export function isDryRun(flag: boolean): boolean {
  return flag;
}

/**
 * Guard: call before any PDS write or state mutation.
 * Logs the record that *would* be written and returns false so callers can skip.
 */
export function guardDryRun(
  dryRun: boolean,
  label: string,
  record: unknown
): boolean {
  if (dryRun) {
    console.log(
      `[dry-run] would write ${label}:`,
      JSON.stringify(record, null, 2)
    );
    return true;
  }
  return false;
}
