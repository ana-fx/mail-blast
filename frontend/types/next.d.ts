declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
  }
}

declare module 'next/image' {
  const Image: any;
  export default Image;
}

