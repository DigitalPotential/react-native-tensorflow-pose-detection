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

### Suggested test to add

- Camera Permission Handling
- Camera Device Initialization
- TensorFlow Model Loading
- Frame Processing Logic
- Frame Resizing Logic
- Keypoints Smoothing and Rendering
- Camera Orientation Handling
- Front Camera Mirroring
- Error Handling
- UI Rendering
- Performance Testing

### Current Problems

- Even though confidence levels are higher now, the drawing of the figure is not landing on my actual body points. I need to review the calculations I've made to draw out the keypoints.
- The front camera has stopped working - the application only works with the back camera currently. What I've noticed is that the front camera picks up the frames and returns body points with high confidence but the screen is just black.
- During development, I noticed that frequent logging would cause performance issues. In the future, I should be more strategic about logging - saving logs and only enabling a few specific logging points at a time to better understand frame input/output without impacting performance.
- Rotation handling is not perfect. The back camera is not rotating correctly.

### Future suggestions

- Simplify rotation handling for front/back cameras
- Enable CoreML Delegate with react-native-fast-tflite
- Experiment with different frame formats:
  - Try switching to YUV format for potential performance gains
  - Explore frame.toArrayBuffer for more direct buffer manipulation
  - Consider using native Frame types for better integration
- Implement a more structured logging strategy:
  - Create a logging system that can be selectively enabled/disabled
  - Store logs for post-processing analysis
  - Focus on specific frame processing stages one at a time

### Technical Journey

Before creating this repo I played around with tensorflow/tfjs-react-native with both older and newer expo versions with no luck - there were many conflicts with the packages needed to run tfjs on react-native. I was hoping to make these tensorflow packages work as it seemed like GPU support would be fairly easy to access with these packages. At this stage I also did some research on the different models offered by tensorflow for pose detection.

The only example project I could find with these packages was 2 years old and once worked with the specified package versions but no longer. I saw on github that many had problems with this specific example project. After some research I started to notice that some of the needed packages were not well maintained and felt that it would be a better option to find other solutions.

After a while of testing different package versions I started to look for other solutions for this pose detection assignment. I decided to do some research on react-native-vision-camera which was included in the initial email with the code test. I recognized the name of the creator of the package and looked him up and found two packages he created that proved useful for this assignment: "react-native-fast-tflite" and "vision-camera-resize-plugin". He also had a blog article where he creates a very similar application.

I kept looking up vision-camera and found some good tips in the docs about working with frame processors as well as using the skia frame processor to directly create drawings within the frame processor. I saw that he used movenet and researched what these models need as input and output. During initial testing, I noticed that confidence levels from the movenet model were pretty low - this became particularly apparent when I was figuring out camera orientation and resizing the frames. I had to do extensive logging to understand what was going wrong with the frame processing pipeline.

I felt that these tools would be perfect to solve this assignment:

- react-native-vision-camera for frame processing
- react-native-fast-tflite was very useful since I did not need to install 5+ different packages just to be able to use tensorflow
- movenet model: movenet-singelpose-lightning-tflite-int8 small and fast model
- react-native-reanimated for useSharedValue
- @shopify/react-native-skia for painting with skia directly inside of the frame processing instance

Some of these packages did not have official expo plugins so I needed to create a development build. Some of my packages also needed a specific minsdkversion that I was not able to set with app.json or app.config.js, so I installed expo build properties. The compileSdkVersion was also something that needed to be set higher than what expo prebuild gave me by default.

### Development Challenges and Solutions

#### 1. Camera Configuration Issues

Initially, I struggled with camera setup and configuration:

- Black screen issues on front camera
- Incorrect frame cropping/resizing
- Orientation mismatches between input and output

I solved these by:

- Implementing proper rotation handling based on device orientation
- Adding explicit format selection for MoveNet compatibility
- Using expo-build-properties to enforce SDK requirements
- Implementing center-cropping logic for square input

#### 2. Model Input Processing

Getting the right input format for the TensorFlow Lite model was tricky:

- Keypoints were appearing offset or scaled incorrectly
- Performance issues with real-time processing
- Color space mismatches (YUV vs RGB)

Solutions included:

- Implementing resize strategy using native plugin
- Creating worklet-based processing pipeline
- Converting YUV to grayscale RGB for model input

#### 3. Coordinate System Transformations

Dealing with different coordinate systems proved challenging:

- Keypoints appearing mirrored or rotated
- Position offsets between actual body and visualization
- Inconsistent behavior across device orientations

I addressed these by:

- Implementing rotation compensation logic
- Adding coordinate system mirroring for front camera
- Creating a transformation pipeline: Model Output → Scale → Rotate → Mirror → Normalize
- Adding smoothing filters for keypoint stabilization

#### 4. Performance Optimization

Real-time processing introduced several performance challenges:

- Dropped frames during processing
- High CPU/GPU usage
- Delayed keypoint updates

I improved performance by:

- Implementing frame sampling (processing every 5th frame)
- Adding ArrayBuffer caching for resize operations
- Moving rendering to Skia Canvas for GPU acceleration
- Using Worklets for cross-thread communication

#### 5. Dependency Management

Package integration required careful handling:

- Android build failures
- Native module compatibility issues
- Expo managed workflow limitations

Solutions involved:

- Adding explicit SDK version constraints
- Integrating expo-build-properties plugin
- Pinning dependency versions

#### 6. Rendering Challenges

Visualization and UI synchronization needed work:

- Keypoint jitter during movement
- Skeleton connections breaking
- Overdraw artifacts in preview

I solved these by:

- Implementing dual rendering system (Skia + React Native)
- Adding confidence threshold filtering
- Creating separate paint objects for lines/circles
- Using exponential smoothing for keypoint positions

I'm happy I was able to get these packages to work together even while using the latest expo version. I created my project with npx create-expo-app@latest so this repo still contains some unused packages, but the core functionality works smoothly with good performance.
