import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

// A television for the video streams (Icecast mounts that send video/webm).
// Power turns it on, CH steps through the channels, and it starts with the sound off
// so it doesn't talk over the radio.
const TV = ({ channels }) => {
  const videoRef = useRef(null);
  const [power, setPower] = useState(false);
  const [sound, setSound] = useState(false);
  const [channelId, setChannelId] = useState(null);
  // true once the video is actually showing
  const [picture, setPicture] = useState(false);
  // how many times the channel knob has been clicked; it turns even when nothing is on
  const [clicks, setClicks] = useState(0);

  const channel = channels.find((c) => c.id === channelId) || channels[0] || null;
  const number = channel ? channels.indexOf(channel) + 1 : 0;
  const url = power && channel ? channel.url : null;

  useEffect(() => {
    const video = videoRef.current;
    setPicture(false);
    if (!url) return undefined;

    let timer;
    let attempts = 0;
    const connect = () => {
      video.src = url;
      const started = video.play();
      if (started) started.catch(() => {});
    };
    // the stream ended or broke: show static and keep trying, up to 15s apart
    const again = () => {
      setPicture(false);
      clearTimeout(timer);
      timer = setTimeout(connect, Math.min(15000, 1000 * 2 ** attempts));
      attempts += 1;
    };
    const onPlaying = () => {
      attempts = 0;
      setPicture(true);
    };
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', again);
    video.addEventListener('ended', again);
    connect();

    return () => {
      clearTimeout(timer);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', again);
      video.removeEventListener('ended', again);
      video.removeAttribute('src');
      video.load();
    };
  }, [url]);

  const nextChannel = () => {
    setClicks(clicks + 1);
    if (channels.length) setChannelId(channels[number % channels.length].id);
  };

  let message = '';
  if (power && !channel) message = 'NO SIGNAL';
  else if (power && !picture) message = `TUNING CH ${number}`;

  return (
    <Set>
      <Antenna $tilt={-28} />
      <Antenna $tilt={24} />
      <Cabinet>
        <Tube>
          <Glass $on={power}>
            {power && !picture && <Static />}
            <Picture ref={videoRef} muted={!sound} playsInline $show={picture} />
            {power && channel && picture && <Osd>{`CH ${number} ${channel.station || ''}`}</Osd>}
            {message && <Message role="status">{message}</Message>}
            <Glare />
          </Glass>
        </Tube>
        <Panel>
          <Knob type="button" aria-label="Next channel" title="Next channel" onClick={nextChannel} $turn={clicks * 40}>
            <KnobMark />
          </Knob>
          <Label>CH</Label>
          <Switch type="button" aria-label={sound ? 'Turn the TV sound off' : 'Turn the TV sound on'} aria-pressed={sound} $on={sound} onClick={() => setSound(!sound)} />
          <Label>SOUND</Label>
          <Grille />
          <Power type="button" aria-label={power ? 'Turn the TV off' : 'Turn the TV on'} aria-pressed={power} $on={power} onClick={() => setPower(!power)} />
          <Label>POWER</Label>
        </Panel>
      </Cabinet>
      <Feet><Foot /><Foot /></Feet>
    </Set>
  );
};

const flicker = keyframes`
  100% { background-position: 50% 0, 60% 50%; }
`;

const Set = styled.div`
  order: 1;
  position: relative;
  z-index: 11;
  align-self: flex-end;
  margin: 0 auto 0 1.5rem;
  padding-top: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Antenna = styled.div`
  position: absolute;
  top: .3rem;
  left: 50%;
  width: .25rem;
  height: 4.5rem;
  background: #F3F6F9;
  border-radius: .2rem;
  transform-origin: bottom center;
  transform: rotate(${(props) => props.$tilt}deg);
`;

const Cabinet = styled.div`
  display: flex;
  align-items: stretch;
  width: 24rem;
  padding: .9rem;
  background: #19A2B8;
  border: outset .3rem #7fd8e6;
  border-radius: 1.5rem 1.5rem 1rem 1rem;
`;

const Tube = styled.div`
  flex: 1;
  padding: .6rem;
  background: #DEC38C;
  border: inset .3rem #7fd8e6;
  border-radius: 1rem;
`;

const Glass = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 12% / 14%;
  background: ${(props) => (props.$on ? '#0b0b0b' : '#23272b')};
`;

// television snow
const Static = styled.div`
  position: absolute;
  inset: 0;
  opacity: .55;
  background:
    repeating-radial-gradient(#000 0 0.0001%, #fff 0 0.0002%) 50% 0 / 2500px 2500px,
    repeating-conic-gradient(#000 0 0.0001%, #fff 0 0.0002%) 60% 60% / 2500px 2500px;
  background-blend-mode: difference;
  animation: ${flicker} .2s infinite alternate;
`;

const Picture = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  visibility: ${(props) => (props.$show ? 'visible' : 'hidden')};
`;

const Osd = styled.div`
  position: absolute;
  top: .7rem;
  left: 1rem;
  font-family: 'Press Start 2P', cursive;
  font-size: .5rem;
  color: #1eff4f;
  text-shadow: 0 0 .2rem black;
`;

const Message = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Press Start 2P', cursive;
  font-size: .6rem;
  color: #1eff4f;
  text-shadow: 0 0 .3rem black, 0 0 .3rem black;
`;

const Glare = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(135deg, rgb(255, 255, 255, .18) 0%, rgb(255, 255, 255, 0) 35%);
`;

const Panel = styled.div`
  width: 4.5rem;
  margin-left: .8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Label = styled.div`
  margin: .2rem 0 .6rem;
  font-family: 'Press Start 2P', cursive;
  font-size: .35rem;
  color: #F3F6F9;
`;

const Knob = styled.button`
  width: 3rem;
  height: 3rem;
  padding: 0;
  border-radius: 50%;
  background: #FFE186;
  border: outset .3rem #E0B650;
  cursor: pointer;
  display: flex;
  justify-content: center;
  transform: rotate(${(props) => props.$turn}deg);
  transition: transform .2s;
`;

const KnobMark = styled.div`
  width: .25rem;
  height: 1rem;
  background: black;
  border-radius: .2rem;
`;

const Switch = styled.button`
  width: 2.6rem;
  height: 1.2rem;
  padding: 0;
  border-radius: .4rem;
  border: outset .2rem lightgray;
  cursor: pointer;
  background: ${(props) => (props.$on ? '#29A745' : 'white')};
`;

const Grille = styled.div`
  flex: 1;
  width: 3.2rem;
  min-height: 1.5rem;
  margin-bottom: .6rem;
  background: repeating-linear-gradient(#0e6272 0 .2rem, transparent .2rem .5rem);
`;

const Power = styled.button`
  width: 1.8rem;
  height: 1.8rem;
  padding: 0;
  border-radius: 50%;
  border: outset .25rem lightgray;
  cursor: pointer;
  background: ${(props) => (props.$on ? '#ee4266' : 'white')};
`;

const Feet = styled.div`
  width: 18rem;
  display: flex;
  justify-content: space-between;
`;

const Foot = styled.div`
  width: 2.5rem;
  height: .8rem;
  background: #0e6272;
  border-radius: 0 0 .5rem .5rem;
`;

export default TV;
