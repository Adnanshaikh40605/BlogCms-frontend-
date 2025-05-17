import styled from 'styled-components';

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${props => props.$height || 'auto'};
  overflow: hidden;
  background-color: #f0f0f0;
  border-radius: ${props => props.$borderRadius || '0'};
  aspect-ratio: ${props => props.$aspectRatio};
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$objectFit || 'cover'};
  object-position: ${props => props.$objectPosition || 'center'};
  border-radius: ${props => props.$borderRadius || '0'};
`;

const Image = ({
  src,
  alt,
  height,
  width,
  className,
  borderRadius,
  objectFit = 'cover',
  objectPosition = 'center',
  aspectRatio = '16/9',
  ...props
}) => {
  return (
    <ImageContainer
      $height={height}
      $width={width}
      $aspectRatio={aspectRatio}
      $borderRadius={borderRadius}
      className={className}
    >
      <StyledImage
        src={src}
        alt={alt}
        $objectFit={objectFit}
        $objectPosition={objectPosition}
        $borderRadius={borderRadius}
        {...props}
      />
    </ImageContainer>
  );
};

export default Image; 