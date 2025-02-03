# 3D Animal WebGL Project

A web-based 3D application built using WebGL that renders and animates a custom animal composed of multiple geometric parts.

## Features

### Basic 3D Modeling

- Hierarchical 3D model of an animal (body, limbs, head, etc.).
- At least eight parts, with a multi-level joint chain (e.g. thigh → calf → foot).
- Real-time user transformations (translation, rotation, scaling) applied to each part.

### Controls

- **Slider-based controls** for joint angles, allowing each limb to bend or rotate.
- **Animation toggles** to run or stop automatic motion (e.g. leg movements, head bob).
- **Global rotation** slider or mouse-based rotation to view the model from all sides.
- **Reset button** to return the model to a default “T-Pose” or neutral stance.

## Technical Implementation

### Core Components

1. **WebGL Setup**
   - Canvas initialization and retrieval of the WebGL rendering context.
   - Depth testing enabled via `gl.enable(gl.DEPTH_TEST)`.
   - Shader program compilation and linkage (vertex and fragment shaders).

2. **Animal Hierarchy & Primitives**
   - Object-oriented design for geometric primitives:
     - `Cube`, `Cylinder`, `Sphere`, etc.
   - A hierarchical structure that supports nested transformations for each part.

3. **User Interface**
   - HTML sliders for:
     - Various limb and joint angles (e.g. thigh rotation, knee bend).
     - Global rotation of the entire animal.
     - Zoom control if implemented.
   - Buttons to:
     - **Run** and **Stop** animations.
     - **Reset** the animal to a default pose.
     - (Optional) **Shift+Click** for a special “poke” animation or effect.

## Resources

- **WebGL Programming Guide** (Matsuda & Lea)
- **WebGL Fundamentals** (webglfundamentals.org)
- **MDN Web Docs** for WebGL & Canvas
- **GLSL Documentation** for shader references

## Requirements

- Modern web browser supporting WebGL (Chrome, Firefox, Safari, Edge).
- JavaScript enabled.
- A local or remote server to serve files (e.g., `python -m http.server`).

## Browser Compatibility

- **Chrome**: Fully tested and compatible.
- **Firefox**: Fully tested and compatible.
- **Safari**: Generally supported, minor variations possible.
- **Edge**: Supported, but performance may vary.

## Known Limitations

- Very large or complex models can impact performance.
- Browser differences in WebGL implementation may cause minor visual or performance discrepancies.
- No explicit touch-screen controls implemented (may require additional handling for mobile devices).