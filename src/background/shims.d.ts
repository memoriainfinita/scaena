// The minified pdf.js build has no typings of its own: it is the same API as the package root.
declare module 'pdfjs-dist/build/pdf.min.mjs' {
  export * from 'pdfjs-dist';
}
