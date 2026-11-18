// B1b: animated-icon.web.tsx'teki CSS modülü içe aktarımı için tip tanımı.
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
