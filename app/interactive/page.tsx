'use client';
import Scene from '../../components/interactive';
import WebcamCapture from '../../components/webcam';
import { useState } from 'react';

export default function Interactive(){
    interface BagSkin {
        model: string;
        texture: string;
        name: string;
        cost: string;
    }
    const [bagSkins, setBagSkins] = useState([
        {model: 'burger-king-paper-bag/source/Bag.fbx', texture: 'burger-king-paper-bag/textures/BagBurgerKing_Diffuse.png', name: 'The King', cost: '2'},
        {model: 'burger-king-paper-bag/source/Bag.fbx', texture: 'burger-king-paper-bag/textures/BagBurgerKing_Normal.png', name: 'The Zesty King', cost: '3'},
    ]);

    const handleCapture = (canvas: HTMLCanvasElement): void => {
        // Convert the canvas to a data URL (base64 image)
        const dataURL = canvas.toDataURL("image/png");
        // Create a new skin using the captured image.
        const newSkin: BagSkin = {
            model: bagSkins[0].model, // re-use the same model
            texture: dataURL,         // use the captured image as texture
            name: 'Custom Skin',
            cost: '0'
        };
        // Add the new skin to the array.
        setBagSkins((prev: BagSkin[]) => [...prev, newSkin]);
    };
    return (
        <main>
            <div
            id='webcam-capture'
                style={{
                    display: 'none'
                }}
            >
                <WebcamCapture onCapture={handleCapture} />
            </div>
            <div
            style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                zIndex: 1,
                padding: '20px',
            }}
            >
            <div id='bag-skin-section' style={{opacity: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', padding: '20px', transition: 'opacity 0.3s ease-in-out'}}>
                <img id="bag-skin" src="null.png" alt="bag skin" width={100} style={{borderRadius: '10px', marginBottom: '10px'}} />
                <div id='skin-info' style={{textAlign: 'center'}}>
                    <h3 id='skin-name' style={{margin: '0', fontSize: '1.2em', color: '#333'}}>{bagSkins[0].name}</h3>
                    <p id='skin-cost' style={{margin: '5px 0 0', fontSize: '1em', color: '#666'}}>{bagSkins[0].cost}</p>
                </div>
            </div>
            </div>
            <Scene bagSkins={bagSkins} />
        </main>
    )
}
