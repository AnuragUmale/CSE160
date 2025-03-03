# 3D Rendering with Phong Shading

## Project Overview

This project implements a 3D rendering system using WebGL with Phong shading model for realistic lighting. The application renders a scene containing a cube, sphere, and optionally an imported model (either an animal or a virtual world from previous assignments), all illuminated using the Phong lighting model.

## Features

### Basic Components

- **3D Objects**:
  - Cube with correctly calculated normals
  - Sphere with programmatically generated vertices and normals
  - Integration with previously created animal model or virtual world

### Lighting System

- **Point Light**:
  - Dynamically moving point light source
  - Visual representation of light source position
  - Adjustable light color

- **Spot Light**:
  - Directional light with focus control
  - Individual on/off toggle

### Lighting Calculations

- Complete **Phong Shading** implementation:
  - Ambient lighting component
  - Diffuse lighting component based on surface orientation
  - Specular highlights based on view direction
  - Proper coordinate transformation for lighting calculations

### Camera Controls

- Interactive camera movement system
- Rotation controls (sliders or keyboard navigation)

### Visualization and Debug Tools

- Normal visualization toggle
- Lighting on/off toggle
- Coordinate system transformation for correct lighting calculation

## Technical Implementation

### Shader Implementation

The project implements two key shaders:

- **Vertex Shader**: Handles vertex transformation, normal calculation, and preparation for lighting
- **Fragment Shader**: Implements the Phong lighting model with ambient, diffuse, and specular components

### Coordinate Transformations

- Object coordinates → World coordinates → Camera coordinates → Screen coordinates
- Special handling for normal transformations using normal matrix

### Buffers and Attributes

- Vertex position buffers
- Normal buffers
- Texture coordinate buffers (if using textures)
- Uniform variables for transformation matrices and lighting parameters

## Controls

| Control | Action |
|---------|--------|
| Sliders/Arrow Keys | Camera movement |
| Toggle Button | Turn lighting on/off |
| Toggle Button | Turn normal visualization on/off |
| Toggle Button | Switch between point light and spotlight |
| Slider | Adjust light position |
| Color Picker | Change light color |

## Getting Started

### Prerequisites

- Web browser with WebGL support
- No additional libraries required

### Running the Application

1. Open `index.html` in a compatible web browser
2. Use the provided controls to interact with the scene
3. Experiment with different lighting configurations

## Implementation Details

### Normal Calculation

- For cubes: Manually calculated or derived from face orientation
- For spheres: Normalized vertex positions (since sphere is centered at origin)
- For complex models: Either imported or calculated using cross products

### Phong Lighting Model

The implementation follows the standard Phong reflection model:

```glsl
Pixel Color = Ambient + Diffuse + Specular

Where:
- Ambient = ambientStrength * lightColor
- Diffuse = max(dot(normal, lightDir), 0.0) * lightColor
- Specular = pow(max(dot(viewDir, reflectDir), 0.0), shininess) * specularStrength * lightColor
```

### Spotlight Implementation

The spotlight effect is achieved by:

1. Defining a spotlight direction
2. Calculating the angle between light direction and spotlight direction
3. Applying attenuation based on this angle and a defined cutoff angle

## Future Improvements

- Shadow mapping
- Multiple light sources
- More complex material properties
- Dynamic object loading
