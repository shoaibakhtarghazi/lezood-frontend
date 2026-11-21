// Shared handle to the Lenis instance (created in App, used by anchors + process tabs).
let lenis = null;
export const getLenis = () => lenis;
export const setLenis = (l) => (lenis = l);