// The logo printed on the cover: a PNG, JPEG or SVG of up to 2 MB, recognised by its first bytes and never by its name.
export type LogoKind = 'png' | 'jpg' | 'svg';

export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export function sniffLogo(bytes: Uint8Array): LogoKind | null {
  if (bytes.length < 8 || bytes.length > MAX_LOGO_BYTES) return null;
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  const head = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, 600)).toLowerCase();
  return head.includes('<svg') ? 'svg' : null;
}

/** The kind of a stored logo from its file name, for the path it gets in the document. */
export const logoKind = (name: string): LogoKind | null => {
  const ext = name.split('.').pop()?.toLowerCase();
  return ext === 'png' || ext === 'jpg' || ext === 'svg' ? ext : null;
};
