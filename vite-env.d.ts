// vite-env.d.ts

/// <reference types="vite/client" />
declare module '*.png' {
  const content: string;
  export default content;
}
declare module '*.svg' {
  const content: string;
  export default content;
}