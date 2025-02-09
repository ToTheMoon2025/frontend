import Landing from "../components/landing";
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
        FurryFi
      </div>
      <div
        id='description'
        style={{
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
          opacity: 0,
          background: 'rgba(0, 0, 0, 0.8)',
        }}
      >
        Fostering a new era of digital social spaces where NFTs become a bridge for creativity, interaction, and cultural exchange.
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
