import React, { useState, useEffect } from 'react';

// components
import Player from './Components/Player/Player.component';
import Header from './Components/Header.component';
import Crayons from './Components/Crayons.component';

// libraires
import styled from 'styled-components';
import { AiFillGithub } from 'react-icons/ai';

// resouces
import headerImg from './Images/text.png';
import { fetchStations, defaultTracks } from './stations';

// color themes; the colors themselves are in index.css
const THEMES = ['classic', 'walnut', 'shore'];
const savedTheme = () => {
  try {
    const t = localStorage.getItem('sbc.theme');
    return THEMES.includes(t) ? t : THEMES[0];
  } catch {
    return THEMES[0];
  }
};

const App = () => {
  // tracks stays null until icecast answers
  const [tracks, setTracks] = useState(null);
  const [poster, setPoster] = useState('');
  const [gif, setGif] = useState('');
  const [height, setHeight] = useState('100vh');
  const [dancing, setDancing] = useState(false);
  const [activeBg, setActiveBg] = useState('');
  const [theme, setTheme] = useState(savedTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    try {
      localStorage.setItem('sbc.theme', theme);
    } catch {
      // private browsing: the theme just isn't remembered
    }
    // the phone's browser bar matches the page
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--page').trim();
  }, [theme]);

  // Keep the station list current: a DJ going live shows up as a new tape, a station that
  // stops loses its tape, and the song titles follow along.
  useEffect(() => {
    let alive = true;
    let busy = false;
    let timer;
    const load = async () => {
      if (busy) return;
      busy = true;
      clearTimeout(timer);
      try {
        const next = await fetchStations();
        if (alive) setTracks(next);
      } catch (error) {
        // icecast is unreachable: keep the tapes we had, or show the default tape if there is one
        console.error(error);
        if (alive) setTracks((prev) => prev || defaultTracks());
      }
      busy = false;
      if (alive) timer = setTimeout(load, document.hidden ? 30000 : 10000);
    };
    const onVisible = () => { if (!document.hidden) load(); };
    load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    // gig posters come from the db, skip when it isn't configured
    if (!import.meta.env.REACT_APP_DB_LINK) return;
    fetch(import.meta.env.REACT_APP_DB_LINK)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setPoster(data.data[0].gigPoster);
          setGif(data.data[1].gigPoster);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    const vh = window.innerHeight;
    setHeight(`${vh}px`);
  }, []);

  useEffect(() => {
    // do stuff with the background
    if (dancing) {
      setActiveBg(gif);
    } else {
      setActiveBg(poster);
    }
  }, [dancing, gif, poster]);

  return (
    <Body id="main" $height={height} $img={activeBg} $header={headerImg}>
      <Header />
      <Crayons themes={THEMES} theme={theme} setTheme={setTheme} />
      <Player
        tracks={tracks && tracks.filter((t) => t.kind !== 'video')}
        channels={tracks ? tracks.filter((t) => t.kind === 'video') : []}
        setDancing={setDancing}
      />
      <Footer>
        <FooterLink href="https://github.com/austinzuffi/sbc" target="_blank" rel="noopener noreferrer">
          <Wide>Wanna see how it works?</Wide>
          <AiFillGithub size='1.3em'/>
        </FooterLink>
        <FooterLink href="https://github.com/joelkperkins/Soft-Boys-Club-Radio" target="_blank" rel="noopener noreferrer">
          with &lt;3 Warlock and Bird
        </FooterLink>
        <ThemeButton type="button" title="Change the colors" onClick={() => setTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length])}>
          theme: {theme}
        </ThemeButton>
        <Wide>v0.2.1</Wide>
      </Footer>
    </Body>
  );
}

const Body = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: ${props => props.$height};
  background-color: var(--page);
  background-image: var(--page-image);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media only screen and (orientation: portrait) {
    ${props => props.$img && props.$header &&
      `background: 
        url(${props.$img}) var(--page) center no-repeat;
      `
    }
    ${props => props.$img && `background-size: 650px`}
  }


  @media (min-width: 800px) {
    ${props => props.$img && props.$header &&
      `background:
        url(${props.$img}) var(--page) center no-repeat;
      `
    }
    ${props => props.$img && `background-size: 650px`}
  }
`;

const Footer = styled.div`
  position: fixed;
  height: 1.2rem;
  bottom: 0;
  right: 0;
  width: 100%;
  font-family: 'Courier New';
  color: var(--footer-fg);
  background-color: var(--footer-bg);
  padding: 0 .25rem;

  @media (max-width: 700px) {
    font-size: .7rem;
  }

  display: flex;
  justify-content: space-evenly;
  align-items: center;
`

const FooterLink = styled.a`
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: .5rem;
  white-space: nowrap;

  &:hover {
    color: var(--footer-hover);
  }
`

// phones have no room for the crayons, so the theme is changed from the footer there
const ThemeButton = styled.button`
  display: none;
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  white-space: nowrap;

  @media (max-width: 799px), (orientation: portrait) {
    display: block;
  }
`

// the question and the version are dropped on phones so the rest fits on one line
const Wide = styled.span`
  @media (max-width: 700px) {
    display: none;
  }
`

export default App;
