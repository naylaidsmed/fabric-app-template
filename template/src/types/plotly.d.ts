// ✅ TIDAK PERLU DIUBAH. Diambil apa adanya dari datacubeapp (types/plotly.d.ts).
// plotly.js-dist-min ships the prebuilt bundle without typings; it exposes the
// same API as plotly.js, which @types/plotly.js describes.
declare module 'plotly.js-dist-min' {
  import * as Plotly from 'plotly.js';
  export default Plotly;
}
