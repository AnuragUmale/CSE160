# WebGL Paint Application

A web-based painting application built using WebGL that allows users to draw geometric shapes on a canvas using mouse interactions.

## Features

### Basic Drawing

- Interactive canvas for drawing shapes
- Click-to-draw functionality
- Click-and-drag drawing capabilities
- Multiple shape brushes:
  - Points
  - Triangles
  - Circles (with adjustable segments)

### Controls

- Shape selection buttons
- Canvas clearing functionality
- Adjustable brush parameters:
  - Size control slider
  - RGB color control sliders
  - Circle segment count slider

## Technical Implementation

### Core Components

1. **WebGL Setup**
   - Canvas initialization
   - WebGL context configuration with `preserveDrawingBuffer: true` for better performance
   - Shader program compilation and setup

2. **Shape Management**
   - Object-oriented design for shapes
   - Classes:
     - Point
     - Triangle
     - Circle
   - Unified shape list for scene management

3. **User Interface**
   - HTML sliders for:
     - RGB color selection
     - Brush size adjustment
     - Circle segment count
   - Shape selection buttons
   - Clear canvas button

### Key Functions

```javascript
setupWebGL()
// Initializes canvas and WebGL context

connectVariablesToGLSL()
// Links JavaScript variables with GLSL shader variables

renderAllShapes()
// Renders all shapes from the shape list

handleClick(event)
// Processes mouse click events and creates appropriate shapes
```

## Testing

- Test performance with large numbers of shapes (100+ objects)
- Verify smooth drawing operations
- Ensure proper color and size controls
- Validate shape rendering accuracy
- Check cross-browser compatibility

## Resources

- WebGL Programming Guide (Matsuda)
- MDN Web Docs for HTML5 Canvas
- WebGL Fundamentals
- GLSL Documentation

## Requirements

- Modern web browser with WebGL support
- JavaScript enabled
- Minimum screen resolution: 1024x768

## Browser Compatibility

- Chrome
- Firefox
- Safari
- Edge

## Known Limitations

- Performance may degrade with extremely large numbers of shapes
- Some browsers may handle WebGL context differently
- Touch screen support may vary by device
