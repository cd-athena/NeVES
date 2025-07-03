import Head from 'next/head';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { GUI } from 'dat.gui';
import type { Stats } from 'stats-js';
import styles from './SampleLayout.module.css';

export type SampleInit = (params: {
  canvas: HTMLCanvasElement;
  pageState: { active: boolean };
  gui?: GUI;
  stats?: Stats;
  videoURL?: string;
}) => Promise<() => void>;

const SampleLayout: React.FunctionComponent<
  React.PropsWithChildren<{
    name: string;
    description: string;
    originTrial?: string;
    filename: string;
    gui?: boolean;
    stats?: boolean;
    init: SampleInit;
  }>
> = (props) => {
  const guiParentRef = useRef<HTMLDivElement | null>(null);
  const gui: GUI | undefined = useMemo(() => {
    if (process.browser) {
      const dat = require('dat.gui');
      return new dat.GUI({ autoPlace: false, width: 600 });
    }
    return undefined;
  }, []);

  const statsParentRef = useRef<HTMLDivElement | null>(null);
  const stats: Stats | undefined = useMemo(() => {
    if (typeof window !== 'undefined') {
      const Stats = require('stats-js');
      return new Stats();
    }
    return undefined;
  }, []);

  const manifestOptions = [
    {
      label: 'Big Buck Bunny',
      url: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
    },
    {
      label: 'Envivio Test Stream',
      url: 'https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd',
    },
    {
      label: 'Tears of Steel',
      url: 'https://media.axprod.net/TestVectors/Cmaf/clear_1080p_h264/manifest.mpd',
    },
  ];

  const [manifestURL, setManifestURL] = useState(manifestOptions[0].url);

  const [error, setError] = useState<unknown | null>(null);
  const canvasParentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (stats && statsParentRef.current) {
      stats.dom.style.position = 'absolute';
      stats.dom.style.right = 'auto';
      stats.dom.style.top = '0px';
      stats.dom.style.left = '0px';
      statsParentRef.current.appendChild(stats.dom);
      stats.showPanel(0);
    }

    if (gui && guiParentRef.current) {
      guiParentRef.current.appendChild(gui.domElement);
    }

    let canvas: HTMLCanvasElement;
    if (canvasParentRef.current) {
      canvasParentRef.current.innerHTML = '';
      canvas = document.createElement('canvas');
      canvasParentRef.current.appendChild(canvas);
    }

    const pageState = { active: true };

    const p = props.init({
      canvas,
      pageState,
      gui,
      stats,
      videoURL: manifestURL,
    });

    return () => {
      p.then((destroy) => destroy());
    };
  }, [manifestURL]);

  return (
    <main>
      <div>
        <h1>{props.name}</h1>
        <p className={styles.bigfont}>
          Example of Neural Enhancement with WebGPU for web browsers (the techniques will be applied only for input content with resolution lower than or equal to 720p).
        </p>
        {error && (
          <>
            <p className={styles.bigfont}>Something went wrong. Do your browser and device support WebGPU?</p>
            <p>{`${error}`}</p>
          </>
        )}
      </div>

      <div className={styles.bigfont}>Select DASH Manifest</div>
      <select className={styles.bigfont}
        onChange={(e) => setManifestURL(e.target.value)}
        defaultValue={manifestOptions[0].url}
      >
        {manifestOptions.map((option) => (
          <option key={option.url} value={option.url}>
            {option.label}
          </option>
        ))}
      </select>

      <div className={`${styles.canvasContainer} ${styles.bigfont}`}>
        <div
          style={{ position: 'absolute', left: 10 }}
          id="statsParent"
          ref={statsParentRef}
        />
        <div
          style={{ position: 'absolute', right: 10 }}
          id="guiParent"
          ref={guiParentRef}
        />
        <div id="canvasParent" ref={canvasParentRef} />
        <div id="canvasControls" className={styles.canvasControls} />
      </div>
    </main>
  );
};

export default SampleLayout;

export const makeSample: (
  ...props: Parameters<typeof SampleLayout>
) => JSX.Element = (props) => {
  return <SampleLayout {...props} />;
};

export function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
