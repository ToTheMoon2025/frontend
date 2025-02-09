// WebcamCapture.js
'use client';
import React, { useRef, useState, useEffect } from 'react';

const WebcamCapture = ({ onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isWebcamStarted, setIsWebcamStarted] = useState(false);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
    }, [stream]);

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setIsWebcamStarted(true);
        } catch (error) {
            console.error("Error accessing webcam", error);
        }
    };

    const stopVideo = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsWebcamStarted(false);
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const width = videoRef.current.videoWidth;
            const height = videoRef.current.videoHeight;
            // Set the canvas dimensions to the video dimensions
            canvasRef.current.width = height;
            canvasRef.current.height = width;
            const ctx = canvasRef.current.getContext("2d");
            // Rotate the image by 90 degrees counterclockwise
            ctx.translate(height / 2, width / 2);
            // ctx.rotate(-Math.PI / 2);
            ctx.drawImage(videoRef.current, -width / 2, -height / 2, width, height);
            // Call the onCapture callback with the canvas element
            if (onCapture) {
                onCapture(canvasRef.current);
            }
            // Stop the webcam after capturing the photo
            stopVideo();
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        }}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '10px',
                }}
            >
                {!isWebcamStarted ? (
                    <button onClick={startVideo}
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '16px',
                        }}
                    >Add Custom Skin</button>
                ) : (
                    <>
                        <video ref={videoRef} style={{ width: "300px", borderRadius: '8px' }} />
                        <br />
                        <button onClick={handleCapture}
                            style={{
                                backgroundColor: 'white',
                                color: 'black',
                                padding: '8px 16px',
                                borderRadius: '16px',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = 'black';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'black';
                                e.target.style.color = 'white';
                            }}
                        >Capture Photo</button>
                    </>
                )}
                {/* The canvas is hidden since we only need it for creating the texture */}
                <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
        </div>
    );
};

export default WebcamCapture;
