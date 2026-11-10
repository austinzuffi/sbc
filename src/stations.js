// Reads the list of live stations from Icecast's status page.

const ICECAST = import.meta.env.REACT_APP_ICECAST_URL;
const JUNGLE = import.meta.env.REACT_APP_JUNGLE_STATION;

// "http://icecast.softboys.club:24836/ozric" -> "/ozric"
const mountOf = (listenurl) => {
  try {
    return new URL(listenurl).pathname;
  } catch {
    return listenurl.slice(listenurl.lastIndexOf('/'));
  }
};

// A station is identified by its mount, which stays the same while other stations come and go.
const toTrack = (s) => {
  const mount = mountOf(s.listenurl);
  const type = s.server_type || s['content-type'] || '';
  return {
    id: mount,
    // video streams go to the TV, everything else is a tape for the radio
    kind: /^video\//i.test(type) || /\.webm$/i.test(mount) ? 'video' : 'audio',
    url: ICECAST + mount,
    genre: s.genre || null,
    title: s.title || s['display-title'] || null,
    station: s.server_name || null,
    desc: s.server_description || null,
    date: s.stream_start || null,
    heardBy: s.listener_peak || null,
    listeners: typeof s.listeners === 'number' ? s.listeners : null,
    type: s.server_type || null
  };
};

// the jungle tape only shows when its station is configured
export const defaultTracks = () => (JUNGLE ? [{
  id: 'jungle',
  kind: 'audio',
  url: JUNGLE,
  genre: null,
  title: null,
  station: 'Jungle',
  desc: null,
  date: null,
  heardBy: null,
  listeners: null,
  type: null
}] : []);

export const fetchStations = async () => {
  const res = await fetch(ICECAST + '/status-json.xsl', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`icecast answered ${res.status}`);
  }
  const { source } = (await res.json()).icestats;
  // icecast sends nothing for zero stations, an object for one, an array for more
  const sources = !source ? [] : Array.isArray(source) ? source : [source];
  return [...defaultTracks(), ...sources.filter((s) => s && s.listenurl).map(toTrack)];
};
