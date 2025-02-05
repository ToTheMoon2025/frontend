'use client';
import Scene from '../../components/room';

export default function RoomPage(){
    return (
        <main>
        <div 
            id='poster_caption'
            style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            fontSize: '2rem',
            fontWeight: 'bold',
            textShadow: '1px 1px 4px black',
            color: 'white',
            zIndex: 1,
            pointerEvents: 'none',
            userSelect: 'none',
            paddingBottom: '10%',
            }}
        >
        </div>
        <Scene/>
        </main>
    )
}
