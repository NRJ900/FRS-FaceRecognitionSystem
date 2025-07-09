# Face-API.js Models

This directory should contain the face-api.js model files for face detection and recognition.

## Required Model Files

Download the following model files from the face-api.js repository and place them in this directory:

1. `tiny_face_detector_model-weights_manifest.json`
2. `tiny_face_detector_model-shard1`
3. `face_landmark_68_model-weights_manifest.json`
4. `face_landmark_68_model-shard1`
5. `face_recognition_model-weights_manifest.json`
6. `face_recognition_model-shard1`
7. `face_recognition_model-shard2`

## Download Links

You can download these files from:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

## File Structure

```
public/models/
├── tiny_face_detector_model-weights_manifest.json
├── tiny_face_detector_model-shard1
├── face_landmark_68_model-weights_manifest.json
├── face_landmark_68_model-shard1
├── face_recognition_model-weights_manifest.json
├── face_recognition_model-shard1
└── face_recognition_model-shard2
```

The application will automatically load these models when starting.