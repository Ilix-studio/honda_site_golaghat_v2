declare module "qr-creator" {
  interface QrCreatorOptions {
    text: string;
    radius?: number;
    ecLevel?: "L" | "M" | "Q" | "H";
    fill?: string;
    background?: string | null;
    size?: number;
  }

  const QrCreator: {
    render(options: QrCreatorOptions, canvas: HTMLCanvasElement): void;
  };

  export default QrCreator;
}
