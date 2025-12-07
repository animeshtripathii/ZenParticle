# ZenParticles

**ZenParticles** is a real-time, interactive 3D particle system that reacts to your hand gestures using computer vision. Built with React, Three.js, and Google MediaPipe.

![ZenParticles Banner](https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop)

## 🌟 Features

-   **Hand Tracking**: Uses MediaPipe to detect hand gestures directly in the browser (GPU-accelerated).
-   **Gesture Control**:
    -   **Open Hand**: Expands the particle field.
    -   **Fist**: Contracts the particles (increases visual tension).
    -   **Clap/Rapid Clench**: Triggers a particle explosion and sound effect.
-   **3D Parametric Shapes**: Morph particles into Hearts, Flowers, Saturn, Buddha, and more.
-   **Audio Reactive**: Generative sound effects synthesized in real-time using the Web Audio API.
-   **Performance**: Optimized WebGL rendering with custom GLSL shaders (Vertex & Fragment).

## 🛠️ Tech Stack

-   **Frontend**: [React 18](https://react.dev/)
-   **3D Graphics**: [Three.js](https://threejs.org/) + GLSL
-   **Computer Vision**: [@mediapipe/tasks-vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/zen-particles.git
    cd zen-particles
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm start
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🌐 Deployment (GitHub Pages)

To host this on GitHub Pages:

1.  Update `package.json` to include your homepage:
    ```json
    "homepage": "https://your-username.github.io/zen-particles",
    ```

2.  Install the `gh-pages` package:
    ```bash
    npm install --save-dev gh-pages
    ```

3.  Add deployment scripts to `package.json`:
    ```json
    "scripts": {
      "predeploy": "npm run build",
      "deploy": "gh-pages -d build"
    }
    ```

4.  Run the deploy command:
    ```bash
    npm run deploy
    ```

## 📱 Mobile Support

This application is optimized for desktop but supports mobile devices.
-   **iOS**: Uses `playsinline` to allow inline video processing for MediaPipe.
-   **Performance**: Adjusts pixel ratio automatically for high-DPI screens.

## 📄 License

This project is licensed under the MIT License.
