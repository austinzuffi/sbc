import React, { useEffect, useRef, useState } from 'react';

// components
import Radio from '../Radio/Radio.component';
import Cassette from '../Cassette/Cassette.component';
import Disco from '../Disco/Disco.component';
import TV from '../TV/TV.component';

// libraries
import styled from 'styled-components';
import { motion } from "framer-motion"
import './Player.css';

// the TV only fits beside the radio on a wide, landscape screen
const WIDE = '(min-width: 1000px) and (orientation: landscape)';
const useWideScreen = () => {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches);
  useEffect(() => {
    const query = window.matchMedia(WIDE);
    const onChange = () => setWide(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return wide;
};

const Player = ({ tracks, channels, setDancing }) => {
  const wideScreen = useWideScreen();
  const constraintsRef = useRef(null);
  // the tape as it was when it was loaded
  const [loaded, setLoaded] = useState(null);
  const [spinTheBall, setSpinTheBall] = useState(false);

  // The loaded tape's latest details (song title) from the station list. If its station has
  // gone off air it stays in the radio, which keeps trying to tune back in.
  const live = loaded && tracks ? tracks.find((t) => t.id === loaded.id) : null;
  const activeTrack = loaded ? (live || loaded) : null;
  const offAir = !!loaded && Array.isArray(tracks) && !live;

  // the disco ball and the dancing background follow the music
  useEffect(() => {
    setDancing(spinTheBall);
  }, [spinTheBall, setDancing]);

  const Cassettes = (tracks && tracks.length) ? tracks.map((track) => {
    if (activeTrack === null || activeTrack.id !== track.id) {
      return (
        <Row key={track.id} >
          <Cassette track={track} constraintsRef={constraintsRef} activeTrack={activeTrack} setActiveTrack={setLoaded} />
        </Row>
      )
    } else {
      return (
        <Row key={track.id}></Row>
      )
    }
  }) : [];

  const DiscoBall = activeTrack === null ?  null :  <Disco spinTheBall={spinTheBall} />;
  // loaded, but no streams are live
  const nothingOnAir = Array.isArray(tracks) && tracks.length === 0;

  return (
    <Container>
      <motion.div className="drag-area" ref={constraintsRef}>
        <Bottom $activeTrack={activeTrack}>
          {wideScreen && <TV channels={channels} />}
          <Radio activeTrack={activeTrack} nothingOnAir={nothingOnAir} offAir={offAir} setActiveTrack={setLoaded} onPlayingChange={setSpinTheBall} />
        </Bottom>
        <Top>
          {Cassettes}
        </Top>
      </motion.div>
      <Background $activeTrack={activeTrack} $spinTheBall={spinTheBall}/>
      {DiscoBall}
    </Container>
  )
};

const Container = styled.div`
  position: absolute;
  width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`
const Background = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${props => props.$activeTrack !== null  && 'rgb(0, 0, 0, .5)'};
  animation: ${props => props.$spinTheBall === true  && 'reflect 4s forwards infinite'};
`

const Row = styled.div`
  position: relative;
  width: 15rem;
  margin: 0 auto;
  height: 10rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  overflow: none;
  margin-bottom: 2rem;
`

const Bottom = styled.div`
  position: absolute;
  display: flex;
  justify-content: flex-end;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 98%;
  z-index: ${props => props.$activeTrack && '100'};
  margin-bottom: 1.5rem;
`

const Top = styled.div`
  position: absolute;
  z-index: 10;
  padding-top: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  top: 0;
  left: 0;
  width: 100%;
`

export default Player;
