import Image from "next/image";
import Landing from "../components/landing";
import { Pirata_One } from "next/font/google";
export default function Home() {
  return (
    <main
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div
        id='title'
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          zIndex: 1,
          padding: '20px',
          fontSize: '5rem',
          fontWeight: 'bold',
          fontFamily: 'Pirata One',
          color: 'white',
          }}>
        To The Moon
      </div>
      <div
        id='team-info'
        style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        fontSize: '5rem',
        fontWeight: 'bold',
        color: 'white',
        zIndex: 1,
        pointerEvents: 'none',
        userSelect: 'none',
        padding: "20% 10%",
        background: 'rgba(0, 0, 0, 0.1)',
        }}>
          NFTSocial - own your metaverse
      </div>
      <div
        id='kbd-info'
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          fontSize: '1rem',
          fontWeight: 'bold',
          color: 'white',
          zIndex: 1,
          pointerEvents: 'none',
          userSelect: 'none',
          paddingBottom: '20px'
        }}
        >
          <p
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.05)',
            }}
          >
            Use &lt; &gt; to navigate

          </p>
        </div>
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        }}>
        <Landing/>
      </div>
    </main>
  );
}
