/**
 * Paper's "05e Hover states · days": anything that opens a day answers the
 * pointer. Put `group` on the link, then these on its parts. With reduced
 * motion only the colours change.
 */
const EASE = "duration-200 ease-soft";

/** The tile or card: lifts 2px with a soft shadow. */
export const HOVER_LIFT = `transition-[translate,box-shadow,background-color,border-color] ${EASE} group-hover:shadow-card motion-safe:group-hover:-translate-y-0.5`;

/** The same lift for a card that is itself the link (and the group). */
export const HOVER_LIFT_SELF = `transition-[translate,box-shadow,border-color] ${EASE} hover:shadow-card motion-safe:hover:-translate-y-0.5`;

/** The cover inside it: zooms a touch within its frame. */
export const HOVER_ZOOM = `transition-transform ${EASE} motion-safe:group-hover:scale-105`;

/** The title or label: warms to daylily. */
export const HOVER_WARM = `transition-colors ${EASE} group-hover:text-daylily-deep`;

/** A rested day's tile deepens a shade, and its soil dot and label with it. */
export const HOVER_REST_TILE = "group-hover:bg-paper-press";
export const HOVER_REST_DOT = `transition-colors ${EASE} group-hover:bg-soil`;
export const HOVER_REST_LABEL = `transition-colors ${EASE} group-hover:text-ink-muted`;
