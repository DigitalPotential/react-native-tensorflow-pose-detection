### Overview

This project is a real-time pose detection application built with Expo and React Native. It uses the device's camera to detect and visualize human body keypoints in real-time. The application leverages several key technologies:

- TensorFlow Lite with the MoveNet model for efficient pose detection
- React Native Vision Camera for high-performance camera access and frame processing
- Skia for hardware-accelerated rendering of pose keypoints and connections
- Reanimated for smooth animations and efficient cross-thread communication

The solution focuses on performance and accuracy, implementing various optimizations like frame sampling, keypoint smoothing, and efficient frame processing to achieve fluid real-time detection and visualization.

### Build Instructions

This project requires a development build to run. Follow these steps:

**Development Environment**: This project was developed and tested using Expo Go on a OnePlus Open device.

1. Install dependencies:

```bash
npm i
```

2. Generate native code:

```bash
npx expo prebuild
```

3. Configure EAS Build:

```bash
eas configure
```

4. Create a development build:

```bash
eas build --profile development --platform android
```

### Testing Status

No tests have been implemented yet, as the primary focus has been on:

1. Getting the core pose detection working
2. Improving the accuracy of body point positions
3. Optimizing performance for real-time processing

### Current Problems

- Even though confidence levels are higher now, the drawing of the figure is not landing on my actual body points. I need to review the calculations I've made to draw out the keypoints.
- The front camera has stopped working - the application only works with the back camera currently. What I've noticed is that the front camera picks up the frames and returns body points with high confidence but the screen is just black.
- During development, I noticed that frequent logging would cause performance issues. In the future, I should be more strategic about logging - saving logs and only enabling a few specific logging points at a time to better understand frame input/output without impacting performance.

### Future suggestions

- Enable CoreML Delegate with react-native-fast-tflite
- Experiment with different frame formats:
  - Try switching to YUV format for potential performance gains
  - Explore frame.toArrayBuffer for more direct buffer manipulation
  - Consider using native Frame types for better integration
- Implement a more structured logging strategy:
  - Create a logging system that can be selectively enabled/disabled
  - Store logs for post-processing analysis
  - Focus on specific frame processing stages one at a time

### Technical Journey comming soon
