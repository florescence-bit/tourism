declare module 'qrcode' {
  interface ToDataURLOptions {
    margin?: number;
    width?: number;
    scale?: number;
    color?: { dark?: string; light?: string };
  }

  export function toDataURL(data: string, options?: ToDataURLOptions): Promise<string>;
  const _default: {
    toDataURL: typeof toDataURL;
  };
  export default _default;
}
