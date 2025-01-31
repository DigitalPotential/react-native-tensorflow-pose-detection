// import { Frame } from 'react-native-vision-camera';

// export const analyzeFrame = (frame: Frame, resized: Int8Array | null) => {
//   try {
//     const buffer = frame.toArrayBuffer();
//     const inputData = new Uint8Array(buffer);
    
//     console.log('=== Frame Processing Analysis ===');
//     console.log('Input Frame:', {
//       dimensions: {
//         width: frame.width,
//         height: frame.height,
//         bytesPerRow: frame.bytesPerRow,
//         totalBytes: buffer.byteLength
//       },
//       format: frame.pixelFormat,
//       cropDimensions: {
//         x: Math.max(0, (frame.width - frame.height) / 2),
//         y: Math.max(0, (frame.height - frame.width) / 2),
//         width: Math.min(frame.width, frame.height),
//         height: Math.min(frame.width, frame.height)
//       },
//       samplePixels: {
//         topLeft: Array.from(inputData.slice(0, 3)),
//         center: Array.from(inputData.slice(Math.floor(buffer.byteLength/2), Math.floor(buffer.byteLength/2) + 3)),
//         bottomRight: Array.from(inputData.slice(buffer.byteLength - 3))
//       }
//     });

//     if (resized) {
//       console.log('Resized Output:', {
//         dimensions: {
//           expectedSize: 192 * 192 * 3,
//           actualSize: resized.length
//         },
//         samplePixels: {
//           topLeft: Array.from(resized.slice(0, 3)),
//           center: Array.from(resized.slice(192 * 96 * 3, (192 * 96 * 3) + 3)),
//           bottomRight: Array.from(resized.slice(resized.length - 3))
//         },
//         stats: {
//           min: Math.min(...Array.from(resized)),
//           max: Math.max(...Array.from(resized)),
//           hasValidRange: resized.every(v => v >= 0 && v <= 255)
//         }
//       });
//     }
//   } catch (e) {
//     console.error('Frame analysis error:', e);
//   }
// }; 

// // Log available camera formats when device is ready
// useEffect(() => {
//     if (device?.formats) {
//       console.log('Available Camera Formats:', 
//         device.formats.map(f => ({
//           width: f.videoWidth,
//           height: f.videoHeight,
//           fps: f.maxFps
//         }))
//       );
//     }
//   }, [device]);