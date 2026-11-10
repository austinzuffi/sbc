import React, { useCallback, useEffect, useState, useRef } from 'react';

// components
import Cassette from '../Cassette/Cassette.component';

// libraries
import styled from 'styled-components';
import { motion } from "framer-motion";
import { GiPlayButton, GiPauseButton } from 'react-icons/gi';
import { MdEject } from 'react-icons/md';

const VOLUME_KEY = 'sbc.volume';
const savedVolume = () => {
  try {
    const v = parseFloat(localStorage.getItem(VOLUME_KEY));
    return v >= 0 && v <= 1 ? v : 1;
  } catch {
    return 1;
  }
};

// phase: idle (stopped) -> connecting -> playing, and reconnecting whenever the stream is lost
const Radio = ({activeTrack, nothingOnAir, offAir, setActiveTrack, onPlayingChange}) => {
  const audioRef = useRef(null);
  const wantPlay = useRef(false);
  const timers = useRef({ retry: null, stall: null, attempts: 0 });
  const [phase, setPhase] = useState('idle');
  const [volume, setVolume] = useState(savedVolume);

  const url = activeTrack ? activeTrack.url : null;
  const urlRef = useRef(url);
  urlRef.current = url;
  // a stream without a song title still shows something sensible
  const nowPlaying = activeTrack ? (activeTrack.title || activeTrack.station || 'Unknown track') : '';
  const station = activeTrack ? (activeTrack.station || 'Soft Boys Club Radio') : '';

  const clearTimers = () => {
    clearTimeout(timers.current.retry);
    clearTimeout(timers.current.stall);
  };

  // Always opens a new connection, so play after a pause is live radio and not an old buffer.
  const connect = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !urlRef.current) return;
    clearTimers();
    audio.src = urlRef.current;
    const started = audio.play();
    if (started) {
      started.catch((error) => {
        // the browser wants a tap first; any other failure arrives as an error event
        if (error && error.name === 'NotAllowedError') {
          wantPlay.current = false;
          setPhase('idle');
        }
      });
    }
  }, []);

  // The stream ended or broke (icecast restarted, the DJ dropped, the phone lost signal):
  // keep trying, waiting 1s, 2s, 4s ... up to 15s between tries, until it is back or someone hits pause.
  const reconnect = useCallback(() => {
    if (!wantPlay.current) return;
    clearTimers();
    setPhase('reconnecting');
    const delay = Math.min(15000, 1000 * 2 ** timers.current.attempts);
    timers.current.attempts += 1;
    timers.current.retry = setTimeout(connect, delay);
  }, [connect]);

  const play = useCallback(() => {
    if (!urlRef.current) return;
    wantPlay.current = true;
    timers.current.attempts = 0;
    setPhase('connecting');
    connect();
  }, [connect]);

  const stop = useCallback(() => {
    wantPlay.current = false;
    clearTimers();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      // drop the connection instead of buffering a stream nobody is hearing
      audio.removeAttribute('src');
      audio.load();
    }
    setPhase('idle');
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const onPlaying = () => {
      clearTimers();
      timers.current.attempts = 0;
      setPhase('playing');
    };
    // out of audio with nothing arriving for 12 seconds counts as a lost stream
    const onWaiting = () => {
      if (!wantPlay.current) return;
      clearTimeout(timers.current.stall);
      timers.current.stall = setTimeout(reconnect, 12000);
    };
    // paused from outside the page, like headphones being unplugged
    const onPause = () => {
      if (wantPlay.current && !audio.ended && !audio.error && audio.getAttribute('src')) stop();
    };
    const onOnline = () => {
      if (wantPlay.current && audio.paused) {
        timers.current.attempts = 0;
        connect();
      }
    };
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', reconnect);
    audio.addEventListener('ended', reconnect);
    audio.addEventListener('pause', onPause);
    window.addEventListener('online', onOnline);
    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', reconnect);
      audio.removeEventListener('ended', reconnect);
      audio.removeEventListener('pause', onPause);
      window.removeEventListener('online', onOnline);
    };
  }, [connect, reconnect, stop]);

  // the tape was ejected or swapped
  useEffect(() => stop, [url, stop]);

  const on = phase !== 'idle';
  useEffect(() => {
    onPlayingChange(on);
  }, [on, onPlayingChange]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      // private browsing: the volume just isn't remembered
    }
  }, [volume]);

  // song title and play / pause on the lock screen and on headphone buttons
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', play);
    navigator.mediaSession.setActionHandler('pause', stop);
  }, [play, stop]);

  useEffect(() => {
    if (!('mediaSession' in navigator) || !window.MediaMetadata) return;
    navigator.mediaSession.metadata = activeTrack ? new window.MediaMetadata({
      title: nowPlaying,
      artist: station,
      album: 'Soft Boys Club Radio',
      artwork: [{ src: '/android-chrome-256x256.png', sizes: '256x256', type: 'image/png' }]
    }) : null;
    navigator.mediaSession.playbackState = !activeTrack ? 'none' : on ? 'playing' : 'paused';
  }, [activeTrack === null, nowPlaying, station, on]);

  const screen = !activeTrack
    ? (nothingOnAir ? 'Nothing on air right now' : 'Please load a tape!')
    : {
        idle: 'Press Play?',
        connecting: 'Tuning in...',
        playing: `Now Playing: ${nowPlaying}`,
        reconnecting: offAir ? 'This station went off air. Waiting for it...' : 'Lost the signal. Retrying...'
      }[phase];

  const PlayButton = activeTrack ? PlayActive : PlayInactive;
  const PauseButton = activeTrack ? PauseActive : PauseInactive;
  const EjectButton = activeTrack ? EjectActive : EjectInactive;

  return (
    <THEMEBODYGOTH id="radio-body">
      <RadioButtons id="radio-buttons">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <PlayButton type="button" aria-label="Play" onClick={play}><GiPlayButton size='2em'/></PlayButton>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <PauseButton type="button" aria-label="Pause" onClick={stop}><GiPauseButton size='2em' /></PauseButton>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <EjectButton type="button" aria-label="Eject the tape" onClick={() => { stop(); setActiveTrack(null); }}>
            <MdEject size='2em' />
          </EjectButton>
        </motion.div>
      </RadioButtons>
      <Volume
        type="range" min="0" max="1" step="0.05" value={volume} aria-label="Volume"
        onChange={(e) => setVolume(parseFloat(e.target.value))}
      />
      <THEMERADIOMAINGOTH id="radio-insert">
        <THEMERADIOINSERTGOTH id="insert-here">
          <THEMESCREENGOTH role="status">{screen}</THEMESCREENGOTH>
          {activeTrack ? <Cassette track={activeTrack} reduced={true} /> : <THEMEINSERTGOTH>------------------------------------</THEMEINSERTGOTH>}
        </THEMERADIOINSERTGOTH>
      </THEMERADIOMAINGOTH>
      <audio ref={audioRef} preload="none" />
    </THEMEBODYGOTH>
  );
}

const RadioMain = styled.div`
  width: 17rem;
  height: 9rem;
  background: gray;
  margin-top: auto;
  border: outset .4rem darkgray;
  border-radius: 1rem;
  display: flex;
  justify-content: flex-start;
  padding: 1rem;
  overflow: hidden;
  align-self: flex-start;
`;

const THEMERADIOMAINGOTH = styled(RadioMain)`
  background: var(--radio);
  border: outset .4rem var(--radio-edge);
`;

const RadioInsert = styled.div`
  width: 16rem;
  height: 100%;
  background: darkgray;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: .5rem;
`;

const THEMERADIOINSERTGOTH = styled(RadioInsert)`
  background: var(--radio-inset);
`

const Screen = styled.div`
  padding: 0rem .5rem;
  width: 75%;
  height: 4rem;
  background: lightgreen;
  margin-bottom: 1rem;
  color: gray;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Press Start 2P', cursive;
  font-size: .5rem;
`;

const THEMESCREENGOTH = styled(Screen)`
  background: var(--screen);
  color: var(--screen-ink);
`

const Insert = styled.div`
  width: 100%;
  height: 4rem;
  background: var(--slot);
  border-radius: .3rem;
  border-left: inset .5rem darkgray;
  border-bottom: inset .5rem darkgray;
  color: gray;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const THEMEINSERTGOTH = styled(Insert)`
  border-left: inset .5rem var(--radio-edge);
  border-bottom: inset .5rem var(--radio-edge);
  color: var(--slot-ink);
`

const RadioButtons = styled.div`
  display: flex;
`;

const Volume = styled.input`
  /* stands upright in the strip to the right of the tape deck; up is louder */
  position: absolute;
  right: .1rem;
  bottom: 3.8rem;
  height: 7rem;
  width: 1rem;
  margin: 0;
  writing-mode: vertical-lr;
  direction: rtl;
  accent-color: var(--slider);
  cursor: pointer;
`;

const RadioBody = styled.div`
  order: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #545454;
  border-radius: 3.5rem 1rem 3.5rem 1rem;
  border: outset .3rem #2b2b2b;
  width: 21rem;
  align-self: flex-end;
`;

const THEMEBODYGOTH = styled(RadioBody)`
  background: var(--radio);
  border: outset .3rem var(--radio-edge);
`

const Play = styled.button`
  z-index: 1;
  align-items: center;
  display: flex;
  justify-content: center;
  border-radius: 2rem .5rem .5rem .5rem;
  border-bottom: outset .3rem var(--btn-edge);
  border-right: outset .3rem var(--btn-edge);
  transform: skew(-30deg, 0deg);
  height: 2rem;
  width: 4rem;
`;


const PlayActive = styled(Play)`
  background-color: var(--play);
  color: var(--play-ink);
`;

const PlayInactive = styled(Play)`
  background-color: var(--btn);
  color: var(--btn-ink);
`;

const Pause = styled.button`
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: .5rem;
  border-bottom: outset .3rem var(--btn-edge);
  border-right: outset .3rem var(--btn-edge);
  transform: skew(-30deg, 0deg);
  height: 2rem;
  width: 4rem;
`;

const PauseActive = styled(Pause)`
  background-color: var(--pause);
  color: var(--pause-ink);
`;

const PauseInactive = styled(Pause)`
  background-color: var(--btn);
  color: var(--btn-ink);
`;

const Eject = styled.button`
  z-index: 1;  
  align-items: center;
  display: flex;
  justify-content: center;
  border-radius: .5rem;
  border-bottom: outset .3rem var(--btn-edge);
  border-right: outset .3rem var(--btn-edge);
  transform: skew(-30deg, 0deg);
  height: 2rem;
  width: 8rem;
`;

const EjectActive = styled(Eject)`
  background-color: var(--eject);
  color: var(--eject-ink);
`;

const EjectInactive = styled(Eject)`
  background-color: var(--btn);
  color: var(--btn-ink);
`;


export default Radio;
