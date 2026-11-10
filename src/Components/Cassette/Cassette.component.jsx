import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, useMotionValue } from "framer-motion";

const Cassette = ({activeTrack, track, constraintsRef, reduced, setActiveTrack}) => {
  const tape = useRef(null);
  const pressedAt = useRef({ x: 0, y: 0 });
  const y = useMotionValue(0);
  const x = useMotionValue(0);
  const name = track.station || track.title || 'Mystery Tape';

  // allows a user to set a track to active by dragging it to the loader
  useEffect(() => {
    if (reduced) return undefined;
    // Measured while dragging, so it stays right after the window is resized or the phone is
    // turned: the tape loads once its bottom edge is past the bottom of the slot and it is over it.
    function checkActive() {
      const slot = document.getElementById('insert-here');
      if (activeTrack || !tape.current || !slot) return;
      const t = tape.current.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      if (t.bottom >= s.bottom && t.right >= s.left && t.left <= s.right) {
        setActiveTrack(track);
      }
    }

    const unsubscribeY = y.on("change", checkActive);
    const unsubscribeX = x.on("change", checkActive);

    return () => {
      unsubscribeY();
      unsubscribeX();
    };
  }, [activeTrack, reduced, setActiveTrack, track, x, y]);

  // a tap, click, Enter or Space loads the tape too
  const load = () => {
    if (!activeTrack) setActiveTrack(track);
  };
  const onTap = () => {
    // letting go at the end of a drag is not a tap
    if (Math.hypot(x.get() - pressedAt.current.x, y.get() - pressedAt.current.y) < 6) load();
  };
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      load();
    }
  };

  if (reduced) {
    return (
      <CassetteClosed>
        <Title>{track.genre || 'Just Chill'}</ Title>
      </CassetteClosed>
    )
  } else if (activeTrack === null || activeTrack.id !== track.id) {
    return (
      <motion.div
        ref={tape}
        drag
        style={{ x, y }}
        dragConstraints={constraintsRef}
        onPointerDown={() => { pressedAt.current = { x: x.get(), y: y.get() }; }}
        onTap={onTap}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Load the ${name} tape`}
      >
        <CassetteOpen>
        <Title>{name}</ Title>
          <Holes>
              <Hole ></Hole >
              <Hole ></Hole >
          </Holes>
          <CassetteBottom>{track.genre}</CassetteBottom>
        </CassetteOpen>
      </motion.div>
    );
  }
  return null;
}

const Title = styled.div`
  text-align: center;
  font-family: 'Rock Salt', cursive;
  font-size: .6rem;
  color: var(--tape-ink);
  width: 90%;
  height: 3rem;
  border: solid .1rem var(--tape-ink);
  border-radius: .3rem;
  padding: .3rem;
  background: var(--tape-label);
`;

// const THEME_TITLE = styled(Title)`
//   background: #F3F6F9;
//   border: solid .1rem #F3F6F9;
//   color: #FFE186;
// `

const CassetteOpen = styled.div`
  position: relative;
  z-index: 6;
  padding-top: .25rem;
  padding-bottom: .25rem;
  width: 15rem;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  align-content: center;
  cursor: pointer;
  border: double .3rem var(--tape-edge);
  border-radius: .5rem;
  overflow: hidden;
  background: var(--tape);
`;

// const THEME_CASSETTE_OPEN = styled(CassetteOpen)`
//   background: white;
//   border: double .3rem #F3F6F9;
// `

const CassetteClosed = styled.div`
  padding-top: .25rem;
  padding-bottom: .25rem;
  width: 15rem;
  height: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  align-content: center;
  cursor: pointer;
  border-top: double .3rem var(--tape-edge);
  border-left: double .3rem var(--tape-edge);
  border-right: double .3rem var(--tape-edge);
  border-radius: .5rem;
  overflow: hidden;
  background: var(--tape);
`;

// const THEME_CASSETTE_CLOSED = styled(CassetteClosed)`
//   background: white;
//   border: double .3rem #F3F6F9;
// `

const CassetteBottom = styled.div`
  font-family: 'Rock Salt', cursive;
  font-size: .5rem;
  display: flex;
  justify-content: center;
  width: 12rem;
  border: solid .1rem var(--tape-ink);
  border-radius: .3rem;
  height: 1.3rem;
  background: var(--tape-label);
`;

// const THEME_CASSETTE_BOTTOM = styled(CassetteBottom)`
//   background: #F3F6F9;
//   border: solid .1rem #F3F6F9;
//   color: #FFE186;
// `

const Holes = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 10rem;
  padding: 1rem;
  height: auto;
`;

const Hole = styled.div`
  width: 2rem;
  height: 2rem;
  background: var(--tape-hole);
  border-radius: 50%;
  border: dashed .3rem var(--tape-reel);
`;

// const THEME_HOLE = styled(Hole)`
//   border: dashed .3rem transparent;
// `

export default Cassette;

