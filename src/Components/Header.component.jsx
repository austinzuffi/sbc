import React from 'react';
import styled from 'styled-components';
import { MdMoreHoriz } from 'react-icons/md'

// pictures of the top of the archive (pioneer.softboys.club), one for each of its themes
import portalGreen from '../Images/portal-green.png';
import portalWalnut from '../Images/portal-walnut.png';
import portalShore from '../Images/portal-shore.png';
import portalJelly from '../Images/portal-jelly.png';

// the archive has no classic theme of its own; classic shows it in its usual green
const PORTALS = { walnut: portalWalnut, shore: portalShore, jelly: portalJelly };

const Header = ({ theme }) => {
  return (
    <Banner className="sbc-banner">
      <Letter className="sbc-letter">S</Letter>
      <Letter className="sbc-letter">O</Letter>
      <Letter className="sbc-letter">F</Letter>
      <Letter className="sbc-letter">T</Letter>
      <MdMoreHoriz className="sbc-banner-dots" color="white" size=".2em" />
      <Letter className="sbc-letter">B</Letter>
      <Letter className="sbc-letter">O</Letter>
      <Letter className="sbc-letter">Y</Letter>
      <Letter className="sbc-letter">S</Letter>
      <MdMoreHoriz className="sbc-banner-dots" color="white" size=".2em" />
      <Letter className="sbc-letter">C</Letter>
      <Letter className="sbc-letter">L</Letter>
      <Letter className="sbc-letter">U</Letter>
      <Letter className="sbc-letter">B</Letter>
      <RadioBox className="sbc-badge sbc-portal" href="https://pioneer.softboys.club" target="_blank" rel="noopener noreferrer" aria-label="Pioneer, the Soft Boys Club archive" title="pioneer: the archive">
        <Portal className="sbc-portal-picture" src={PORTALS[theme] || portalGreen} alt="" />
      </RadioBox>
    </Banner>
  )
};


const Banner = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  background-color: var(--banner);
  padding-left: .5rem;
`;

const Letter = styled.div`
  font-family: 'Arima Madurai', cursive;
  color: var(--banner-ink);
  font-size: 1.7rem;
  font-weight: 800;
`;

// A small tilted window onto the archive. It straightens and grows under the pointer.
const RadioBox = styled.a`
  overflow: hidden;
  transform-origin: top right;
  transition: transform .2s;
  @media (hover: hover) {
    &:hover {
      transform: rotate(0deg) scale(1.6);
      z-index: 12;
    }
  }
@media only screen and (orientation: portrait) {
    transform: rotate(-5deg);
    width: 34%;
    height: 3.4rem;
    background-color: var(--badge);
    display: flex;
    align-items: center;
    justify-content: center;
    border: .1rem solid var(--badge-ink);
    border-radius: .5rem;
    position: absolute;
    right: 0;
    top: 2rem;
    z-index: 11;
  }
  @media (min-width: 800px) {
    border-radius: .5rem;
    transform: rotate(-4deg);
    width: 22%;
    height: 4.8rem;
    background-color: var(--badge);
    display: flex;
    align-items: center;
    justify-content: center;
    border: .3rem solid var(--badge-ink);
    position: absolute;
    right: 0;
    top: 2rem;
    z-index: 11;
  }
`;

// the top left corner of the picture is the part that has to show
const Portal = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left top;
`;

export default Header;
