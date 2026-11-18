import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

// The volume wheel on the right side of the radio, seen from the front, so only its ridged edge
// sticks out, like on an old tape player. It turns from 0 (down) to 11 (up).
// value is 0..1 (what audio.volume takes); the wheel shows it as 0..11.
// It's drawn in 3D: --tilt on .sbc-volume turns it towards you, to show its outer face too.
const TOP = 11;
const SWEEP = 140;            // degrees the wheel turns from 0 to 11, all on the side facing you
const STEP = 1 / (TOP * 2);   // a key press or wheel notch moves half a number
const RIDGES = 32;            // flat strips round the edge; every fourth has a groove for grip

const clamp = (v) => Math.min(1, Math.max(0, v));

const VolumeKnob = ({ value, onChange }) => {
  const dial = useRef(null);
  const drag = useRef(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const set = (v) => onChange(clamp(v));

  // Push the edge up or down with a finger or the mouse; it moves with you, like the real thing.
  const onPointerDown = (e) => {
    e.preventDefault();
    dial.current.focus();
    dial.current.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, radius: dial.current.getBoundingClientRect().height / 2 };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const moved = drag.current.y - e.clientY;   // up is louder
    drag.current.y = e.clientY;
    const turned = (moved / drag.current.radius) * 180 / Math.PI;
    set(valueRef.current + turned / SWEEP);
  };
  const onPointerUp = () => { drag.current = null; };

  const onKeyDown = (e) => {
    const moves = {
      ArrowUp: STEP, ArrowRight: STEP, ArrowDown: -STEP, ArrowLeft: -STEP,
      PageUp: 1 / TOP, PageDown: -1 / TOP,
    };
    if (e.key in moves) set(value + moves[e.key]);
    else if (e.key === 'Home') set(0);
    else if (e.key === 'End') set(1);
    else return;
    e.preventDefault();
  };

  // scrolling over the wheel turns it (React's wheel listener can't stop the page scrolling)
  useEffect(() => {
    const el = dial.current;
    const onWheel = (e) => {
      e.preventDefault();
      set(valueRef.current + (e.deltaY < 0 ? STEP : -STEP));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  const turn = (value - .5) * SWEEP;   // 0 is turned down, 11 up, 5.5 straight at you
  const shown = Math.round(value * TOP * 2) / 2;
  return (
    <Dial
      ref={dial}
      className="sbc-volume"
      role="slider"
      tabIndex={0}
      aria-label="Volume"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={TOP}
      aria-valuenow={shown}
      aria-valuetext={`Volume ${shown} of ${TOP}`}
      title={`Volume: ${shown}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <Mark className="sbc-volume-number" style={{ top: 'calc(50% - var(--wheel-reach))' }} aria-hidden="true">11</Mark>
      <Mark className="sbc-volume-number" style={{ top: 'calc(50% + var(--wheel-reach))' }} aria-hidden="true">0</Mark>
      <Slot className="sbc-volume-slot" />
      <Tilt>
        <Spin style={{ transform: `rotateX(${turn}deg)` }}>
          {Array.from({ length: RIDGES }, (_, i) => {
            const at = (i * 360) / RIDGES;
            // light comes from the front: a strip facing you is bright, one turning away is dark
            const facing = Math.cos(((at + turn) * Math.PI) / 180);
            return (
              <Ridge
                key={i}
                className={i === 0 ? 'sbc-volume-ridge sbc-volume-knob-mark' : 'sbc-volume-ridge'}
                style={{
                  transform: `rotateX(${at}deg) translateZ(var(--wheel-radius))`,
                  // rounded-off corners at both ends of the edge, then the shade
                  boxShadow: `inset .07rem 0 0 rgb(0 0 0 / .3), inset -.07rem 0 0 rgb(0 0 0 / .3), inset 0 0 0 5rem rgb(0 0 0 / ${(0.5 - 0.5 * Math.max(0, facing)).toFixed(3)})`,
                }}
                $groove={i % 4 === 2}
              />
            );
          })}
          <Face className="sbc-volume-face"><Pointer className="sbc-volume-knob-mark" /></Face>
        </Spin>
      </Tilt>
    </Dial>
  );
};

const Dial = styled.div`
  --wheel-radius: 1.6rem;
  --wheel-depth: 1rem;
  --wheel-reach: 1.5rem; /* how far up and down the mark goes: sin(SWEEP / 2) of the radius */
  --tilt: 25deg;
  position: absolute;
  z-index: 1; /* above the page's dimming layer, like the buttons */
  top: 50%;
  left: calc(100% + var(--radio-border, .3rem) - .05rem);
  width: var(--wheel-depth);
  height: calc(2 * var(--wheel-radius));
  margin-top: calc(-1 * var(--wheel-radius));
  perspective: 14rem;
  cursor: ns-resize;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  outline: none;
  /* a bigger target than the thin edge, for fingers */
  &::before {
    content: '';
    position: absolute;
    inset: -.3rem -.5rem;
  }
  &:focus-visible::after {
    content: '';
    position: absolute;
    inset: -.25rem;
    border-radius: .3rem;
    outline: .12rem solid var(--dial-ink);
  }
`;

// 0 and 11, printed on the side of the case next to the wheel
const Mark = styled.span`
  position: absolute;
  /* clear of the wheel, which leans over the case when it's tilted */
  right: calc(100% + var(--radio-border, .3rem) + .25rem + var(--wheel-radius) * sin(var(--tilt)));
  margin-top: -.25rem;
  font-family: 'Press Start 2P', cursive;
  font-size: .4rem;
  line-height: .5rem;
  color: var(--dial-ink);
  pointer-events: none;
`;

const Tilt = styled.div`
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  /* turns on the end that's in the case, so the wheel stays in its slot */
  transform-origin: left center;
  transform: rotateY(calc(-1 * var(--tilt)));
  pointer-events: none;
`;

const Spin = styled.div`
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
`;

const Ridge = styled.div`
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  /* a strip of the edge: 2 * radius * tan(180deg / RIDGES), with a hair of overlap */
  height: calc(2 * var(--wheel-radius) * 0.0985 + .02rem);
  margin-top: calc(-1 * var(--wheel-radius) * 0.0985 - .01rem);
  box-sizing: border-box;
  background: var(--knob);
  border-top: ${(props) => (props.$groove ? '.05rem solid rgb(0 0 0 / .22)' : '0')};
  backface-visibility: hidden;
  /* the mark: a line painted across the edge */
  &.sbc-volume-knob-mark {
    background: linear-gradient(transparent 25%, var(--btn-ink) 25% 75%, transparent 75%), var(--knob);
  }
`;

// the slot in the case the wheel comes out of
const Slot = styled.div`
  position: absolute;
  top: -.15rem;
  bottom: -.15rem;
  right: calc(100% - .05rem);
  width: calc(var(--radio-border, .3rem) + .1rem);
  border-radius: .15rem 0 0 .15rem;
  background: rgb(0 0 0 / .45);
  box-shadow: inset .08rem 0 .12rem rgb(0 0 0 / .5);
  pointer-events: none;
`;

// the outer face of the wheel, only seen when it's tilted
const Face = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(2 * var(--wheel-radius));
  height: calc(2 * var(--wheel-radius));
  margin: calc(-1 * var(--wheel-radius));
  border-radius: 50%;
  box-sizing: border-box;
  background: radial-gradient(circle at 45% 40%, rgb(255 255 255 / .25), rgb(0 0 0 / .2) 75%), var(--knob);
  border: .08rem solid rgb(0 0 0 / .3);
  transform: rotateY(90deg) translateZ(calc(var(--wheel-depth) / 2));
  backface-visibility: hidden;
  display: flex;
  align-items: center;
`;

// on the face, pointing the same way as the mark on the edge (towards you at 5.5)
const Pointer = styled.div`
  width: 50%;
  height: .18rem;
  border-radius: .1rem;
  background: var(--btn-ink);
`;

export default VolumeKnob;
