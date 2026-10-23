// Web standards every runtime Daylily runs on has (Node, Electron, browsers), declared
// here because the core leaves out the DOM and Node types to stay pure

declare class TextEncoder {
  encode(input: string): Uint8Array<ArrayBuffer>;
}

declare const crypto: {
  subtle: {
    digest: (
      algorithm: "SHA-256",
      data: Uint8Array<ArrayBuffer>
    ) => Promise<ArrayBuffer>;
  };
};
