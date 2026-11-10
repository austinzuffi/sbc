import React, { useState, useEffect } from 'react';

// components
import Player from './Components/Player/Player.component';
import Header from './Components/Header.component';

// libraires
import styled from 'styled-components';
import { AiFillGithub } from 'react-icons/ai';

// resouces
import headerImg from './Images/text.png';
import { fetchStations, defaultTracks } from './stations';

const App = () => {
  // tracks stays null until icecast answers
  const [tracks, setTracks] = useState(null);
  const [poster, setPoster] = useState('');
  const [gif, setGif] = useState('');
  const [height, setHeight] = useState('100vh');
  const [dancing, setDancing] = useState(false);
  const [activeBg, setActiveBg] = useState('');

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
      <Player
        tracks={tracks && tracks.filter((t) => t.kind !== 'video')}
        channels={tracks ? tracks.filter((t) => t.kind === 'video') : []}
        setDancing={setDancing}
      />
      <Footer href="https://github.com/austinzuffi/sbc" target="_blank" rel="noopener noreferrer">
        Wanna see how it works?
        <AiFillGithub size='1.3em'/>
        v0.2.1
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
  background-color: black;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media only screen and (orientation: portrait) {
    ${props => props.$img && props.$header &&
      `background: 
        url(${props.$img}) black center no-repeat;
      `
    }
    ${props => props.$img && `background-size: 650px`}
  }


  @media (min-width: 800px) {
    ${props => props.$img && props.$header &&
      `background:
        url(${props.$img}) black center no-repeat;
      `
    }
    ${props => props.$img && `background-size: 650px`}
  }
`;

const Footer = styled.a`
  text-decoration: none;
  position: fixed;
  height: 1.2rem;
  bottom: 0;
  right: 0;
  width: 100%;
  font-family: 'Courier New';
  color: gray;
  background-color: black;
  padding: 0 .25rem;

  display: flex;
  justify-content: space-evenly;
  align-items: center;
`

export default App;
