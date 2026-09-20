/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module 'canvas-confetti' {
  const confetti: any;
  export default confetti;
}

declare module 'prismjs' {
  const Prism: any;
  export default Prism;
}

declare module 'prismjs/*' {
  const content: any;
  export default content;
}
