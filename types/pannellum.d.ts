/**
 * Pannellum ships no types. It is a UMD bundle whose only job here is to
 * attach `window.pannellum`, so the modules are declared as side-effect
 * imports and the API surface is typed at the call site.
 */
declare module "pannellum/build/pannellum.js";
declare module "pannellum/build/pannellum.css";
