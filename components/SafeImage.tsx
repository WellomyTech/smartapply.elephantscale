'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type Props = Omit<ImageProps, 'onError'> & {
  fallbackSrc?: string;
};

export default function SafeImage({ src, fallbackSrc, alt, ...rest }: Props) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <Image
      {...rest}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
