# WebGL Voxel World Project

A web-based 3D application built using WebGL that constructs and renders a voxel-based environment (32×32×4 or larger) and includes a first-person camera for immersive exploration. The world can be populated with walls of varying heights, a ground plane, a skybox, and optionally additional entities such as animals or storytelling elements.

## Features

### Basic 3D World

- **Grid-based layout** (e.g., 32×32) defined by a 2D array specifying wall heights (0 to 4).
- **Walls** composed of stacked textured cubes to form varying heights.
- **Ground** implemented with a flattened/scaled cube.
- **Skybox** implemented via a large cube enclosing the scene.
- **Multiple textures** used for walls, ground, sky, and optional extra objects.

### Camera & Controls

- **First-person perspective** with perspective projection.
- **Keyboard controls**:
  - **W/S**: Move forward/backward
  - **A/D**: Strafe left/right
  - **Q/E**: Turn camera left/right
- **Mouse look**: Move the mouse (optionally while pressing a button) to rotate the camera’s yaw and pitch.
- **Optional:** Add or remove blocks in front of the camera (“simple Minecraft”), or integrate a mini-story or animations (e.g. animals).

## Technical Implementation

### Core Components

1. **WebGL Initialization**
   - Canvas setup and retrieval of `WebGLRenderingContext`.
   - Depth test enabled (`gl.enable(gl.DEPTH_TEST)`).
   - Shader program creation (vertex & fragment).
   - Uniforms/attributes for coordinates, textures, color, and projection matrices.

2. **World Generation**
   - 2D map defines how many cubes to stack at each (x,z).
   - Loops create and position cubes:
     - Ground plane (flattened cube).
     - Skybox (large cube around the world).
     - Walls (stacked cubes with specific textures).

3. **Camera & Projection**
   - First-person camera storing:
     - **View matrix**: `setLookAt(...)`
     - **Projection matrix**: `setPerspective(...)` or similar.
   - Keyboard events for forward, backward, left, right, and yaw rotation.
   - Mouse movement events for pitch and yaw changes.

4. **Textures & Shading**
   - **TextureManager** or similar class for loading multiple images (grass, wall, sky, etc.).
   - Fragment shader can blend texture color with a base color if needed (using `u_texColorWeight` or a similar uniform).
   - Mipmapping for power-of-two textures if desired, or fallback clamp edges for non-power-of-two.

5. **Optional Features**
   - **Simple Minecraft** add/remove blocks: detect the map cell in front of the camera and modify.
   - **Animated animals**: hierarchical shapes or imported models with basic movement/AI.
   - **Day/Night cycle**: a rotating sky color or light position.

## Setup & Usage

1. **Local Web Server**  
   - Run a server (e.g., `python -m http.server`) to serve `index.html`.
   - Open `http://localhost:<port>` in a compatible WebGL browser.

2. **Controls**  
   - **W/S/A/D**: Move forward, backward, strafe left, right.
   - **Q/E**: Turn left/right (yaw) if not using mouse look.
   - **Mouse Look**: Move mouse to rotate camera’s yaw/pitch (if implemented).

3. **Customization**  
   - Edit the `map` array in `worldData.js` or equivalent file to define a new layout.
   - Update or replace texture images in `resources/textures` as needed.

## Requirements & Compatibility

- **Modern Browser** supporting WebGL (Chrome, Firefox, Safari, Edge).
- **JavaScript enabled** and served over a local/remote server.
- **Power-of-two textures** recommended for mipmapping (e.g., 256×256 or 1024×1024).

## Known Limitations

- Large 32×32 or bigger worlds with many cubes might reduce performance on some devices.
- Mobile/touch controls not explicitly supported, though could be extended.
- Potential visual artifacts or blending issues if many transparent cubes overlap.
