import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type WherebyEmbedProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  room: string;
  minimal?: string;
  background?: string;
  logo?: string;
  cameraEffect?: string;
  localization?: string;
  precallReview?: string;
  skipMediaPermissionPrompt?: boolean;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'whereby-embed': WherebyEmbedProps;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'whereby-embed': WherebyEmbedProps;
    }
  }
}
