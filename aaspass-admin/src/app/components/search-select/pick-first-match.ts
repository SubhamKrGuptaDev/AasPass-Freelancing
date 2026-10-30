import { BrnAutocomplete } from '@spartan-ng/brain/autocomplete';

/**
 * Keydown guard (register in the capture phase, before the autocomplete input's own handler).
 *
 * The autocomplete's Enter picks its highlighted item, which is only refreshed once the list has
 * re-rendered. An Enter typed straight after the last letter (fast typing, slow device) therefore
 * picked from the previous list: "pune" + Enter selected "Punalūr", the first "pun" match. `matches`
 * is recomputed synchronously on every keystroke, so when the highlighted item is not one of them
 * this picks the current first match instead (or nothing, if there is none) and stops the event.
 *
 * Returns true when it handled the event. A highlight that is part of `matches` (auto-highlighted
 * or moved with the arrows) and a blank search are left to the autocomplete.
 */
export function pickFirstMatchOnStaleEnter(
  event: KeyboardEvent,
  autocomplete: BrnAutocomplete<string> | undefined,
  search: string,
  matches: readonly string[],
): boolean {
  if (event.key !== 'Enter' || event.isComposing || !autocomplete?.isExpanded() || !search.trim()) {
    return false;
  }
  const active = autocomplete.keyManager.activeItem?.value();
  if (active != null && matches.includes(active)) {
    return false;
  }
  event.preventDefault();
  event.stopPropagation();
  const first = matches[0];
  if (first !== undefined) {
    autocomplete.select(first);
  }
  return true;
}
