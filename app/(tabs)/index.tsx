import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useSkiaFrameProcessor,
} from "react-native-vision-camera";
import { useTensorflowModel } from "react-native-fast-tflite";
import { useResizePlugin } from "vision-camera-resize-plugin";
import { Skia } from "@shopify/react-native-skia";
import { useSharedValue } from "react-native-reanimated";

// connections between body points to draw lines
const CONNECTIONS = [
  [5, 6], // shoulders
  [5, 7], // left upper arm
  [7, 9], // left lower arm
  [6, 8], // right upper arm
  [8, 10], // right lower arm
  [5, 11], // left torso
  [6, 12], // right torso
  [11, 12], // hips
  [11, 13], // left thigh
  [13, 15], // left calf
  [12, 14], // right thigh
  [14, 16], // right calf
];

type Position = { x: number; y: number; confidence: number };

declare global {
  var __lastLog: number | null;
}

// helps smooth out jittery movements
const SMOOTHING_FACTOR = 0.3;

function CameraApp() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const [isActive] = useState(true);

  const model = useTensorflowModel(
    require("../../assets/movenet-model.tflite")
  );
  const { resize } = useResizePlugin();

  const keypoints = useSharedValue<Position[]>(
    Array(17).fill({ x: 0, y: 0, confidence: 0 })
  );

  const format = useCameraFormat(device, [
    { videoResolution: { width: 480, height: 640 } },
    { fps: 30 },
  ]);

  useEffect(() => {
    requestPermission();
  }, []);

  const linePaint = Skia.Paint();
  linePaint.setStrokeWidth(2);
  linePaint.setColor(Skia.Color("white"));

  const circlePaint = Skia.Paint();
  circlePaint.setColor(Skia.Color("red"));

  const frameProcessor = useSkiaFrameProcessor(
    (frame) => {
      "worklet";
      if (model.state !== "loaded") return;

      try {
        const isFrontCamera = device?.position === "front";
        let rotation: "0deg" | "90deg" | "180deg" | "270deg" = "0deg";

        // need to handle rotation differently for front/back camera
        switch (frame.orientation) {
          case "portrait":
            rotation = "0deg";
            break;
          case "landscape-left":
            rotation = isFrontCamera ? "90deg" : "270deg";
            break;
          case "landscape-right":
            rotation = isFrontCamera ? "270deg" : "90deg";
            break;
          default:
            rotation = "0deg";
        }

        const rotatedWidth =
          rotation === "90deg" || rotation === "270deg"
            ? frame.height
            : frame.width;
        const rotatedHeight =
          rotation === "90deg" || rotation === "270deg"
            ? frame.width
            : frame.height;

        // movenet needs square input (192x192)
        const targetAspect = 192 / 192;
        const frameAspect = rotatedWidth / rotatedHeight;

        const crop = {
          x: 0,
          y: 0,
          width: rotatedWidth,
          height: rotatedHeight,
        };

        // center crop the frame to get a square
        if (frameAspect > targetAspect) {
          crop.width = rotatedHeight * targetAspect;
          crop.x = (rotatedWidth - crop.width) / 2;
        } else {
          crop.height = rotatedWidth / targetAspect;
          crop.y = (rotatedHeight - crop.height) / 2;
        }

        // resize to movenet input size and convert to rgb
        const resized = resize(frame, {
          rotation,
          scale: { width: 192, height: 192 },
          crop,
          pixelFormat: "rgb",
          dataType: "uint8",
        });

        if (!resized) return;

        // run inference and check we got all keypoints
        const output = model.model.runSync([resized])?.[0];
        if (!output || output.length < 51) return;

        // scale back to original frame size
        const scaleFactorX = frame.width / 192;
        const scaleFactorY = frame.height / 192;

        const newKeypoints = keypoints.value.map((prev, i) => {
          const yModel = Number(output[i * 3]);
          const xModel = Number(output[i * 3 + 1]);
          const confidence = Number(output[i * 3 + 2]);

          // skip low confidence points
          if (confidence <= 0.2) return prev;

          // lots of coordinate transforms to get back to screen space
          let xCropped = xModel * 192 * scaleFactorX;
          let yCropped = yModel * 192 * scaleFactorY;

          let xRotated = xCropped + crop.x;
          let yRotated = yCropped + crop.y;

          // Adjust for rotation
          let xOriginal, yOriginal;
          switch (rotation) {
            case "90deg":
              xOriginal = yRotated;
              yOriginal = frame.width - xRotated; // Use original frame width
              break;
            case "270deg":
              xOriginal = frame.height - yRotated; // Use original frame height
              yOriginal = xRotated;
              break;
            default:
              xOriginal = xRotated;
              yOriginal = yRotated;
          }

          // Normalize using original frame dimensions
          let xNormalized = xOriginal / frame.width;
          let yNormalized = yOriginal / frame.height;

          // Flip Y-axis to match screen coordinates
          yNormalized = 1 - yNormalized;

          // Mirror for front camera
          if (isFrontCamera) {
            xNormalized = 1 - xNormalized;
          }

          return {
            x: prev.x * SMOOTHING_FACTOR + xNormalized * (1 - SMOOTHING_FACTOR),
            y: prev.y * SMOOTHING_FACTOR + yNormalized * (1 - SMOOTHING_FACTOR),
            confidence,
          };
        });

        keypoints.value = newKeypoints;

        // Draw keypoints and connections
        frame.render();
        newKeypoints.forEach((kp) => {
          if (kp.confidence > 0.2) {
            frame.drawCircle(
              kp.x * frame.width,
              kp.y * frame.height,
              4,
              circlePaint
            );
          }
        });

        CONNECTIONS.forEach(([start, end]) => {
          const startKp = newKeypoints[start];
          const endKp = newKeypoints[end];
          if (startKp?.confidence > 0.2 && endKp?.confidence > 0.2) {
            frame.drawLine(
              startKp.x * frame.width,
              startKp.y * frame.height,
              endKp.x * frame.width,
              endKp.y * frame.height,
              linePaint
            );
          }
        });
      } catch (e) {
        console.error(`Frame processing error: ${e}`);
      }
    },
    [model, resize, keypoints, device?.position]
  );

  if (!hasPermission || !device) {
    return (
      <View style={styles.container}>
        <Text>
          {!hasPermission ? "Camera permission required!" : "No camera found"}
        </Text>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        frameProcessor={frameProcessor}
        pixelFormat="rgb"
        format={format}
        resizeMode="contain"
        isMirrored={device.position === "front"} // Mirror preview for front camera
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CameraApp;
