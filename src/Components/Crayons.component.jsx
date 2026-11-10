import React from 'react';
import styled from 'styled-components';

// One crayon per color theme, under the RADIO badge. Clicking one colors the page with it.
// Only on desktop; phones get the theme button in the footer.
const CRAYONS = {
  classic: { color: '#E9573F', tilt: -7 },
  walnut: { color: '#C39A60', tilt: 3 },
  shore: { color: '#647D7D', tilt: 9 }
};

const Crayons = ({ themes, theme, setTheme }) => (
  <Box>
    {themes.map((name) => (
      <Crayon
        key={name}
        type="button"
        title={`${name} colors`}
        aria-label={`Use the ${name} colors`}
        aria-pressed={theme === name}
        $tilt={CRAYONS[name].tilt}
        $picked={theme === name}
        onClick={() => setTheme(name)}
      >
        <Tip $color={CRAYONS[name].color} />
        <Stick $color={CRAYONS[name].color} />
      </Crayon>
    ))}
  </Box>
);

const Box = styled.div`
  position: absolute;
  top: 7.6rem;
  right: 5%;
  z-index: 11;
  display: flex;
  gap: .7rem;

  @media (max-width: 799px), (orientation: portrait) {
    display: none;
  }
`;

// the picked crayon is pulled out of the row
const Crayon = styled.button`
  width: 1.3rem;
  height: 5.5rem;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: rotate(${(props) => props.$tilt}deg) translateY(${(props) => (props.$picked ? '-.7rem' : '0')});
  transition: transform .15s;

  &:hover {
    transform: rotate(${(props) => props.$tilt}deg) translateY(-.7rem);
  }
`;

const Tip = styled.div`
  width: 100%;
  height: 1.2rem;
  background: ${(props) => props.$color};
  clip-path: polygon(50% 0, 82% 100%, 18% 100%);
`;

// a paper wrapper with a dark band at each end
const Stick = styled.div`
  flex: 1;
  width: 100%;
  border-radius: .15rem;
  outline: .05rem solid rgb(0, 0, 0, .35);
  background:
    linear-gradient(
      transparent 0 10%,
      rgb(0, 0, 0, .35) 10% 15%,
      rgb(255, 255, 255, .28) 15% 85%,
      rgb(0, 0, 0, .35) 85% 90%,
      transparent 90%
    ),
    ${(props) => props.$color};
`;

export default Crayons;
