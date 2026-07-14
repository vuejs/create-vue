<script setup>
import ParticlesBackground from '../components/ParticlesBackground.vue'
import FireworksCanvas from '../components/FireworksCanvas.vue'
</script>

<template>
  <div class="particles-demo">
    <h2>✨ Particles & Fireworks Demo</h2>
    
    <div class="demo-section">
      <h3>tsParticles Background (Fireworks Preset)</h3>
      <div class="demo-box">
        <ParticlesBackground 
          preset="fireworks" 
          :full-screen="false" 
          height="300"
          background="#0a0a0a"
        />
      </div>
    </div>

    <div class="demo-section">
      <h3>Custom Particles (Interactive)</h3>
      <div class="demo-box">
        <ParticlesBackground 
          id="custom-particles"
          :options="{
            particles: {
              color: { value: ['#ff6b6b', '#4ecdc4', '#45b7d1'] },
              number: { value: 60 },
              size: { value: { min: 2, max: 6 } },
              links: { enable: true, color: '#ffffff', opacity: 0.3 }
            },
            interactivity: {
              events: {
                onHover: { enable: true, mode: 'repulse' },
                onClick: { enable: true, mode: 'push' }
              }
            }
          }"
          height="280"
        />
      </div>
    </div>

    <div class="demo-section">
      <h3>Fireworks Canvas (Click to launch!)</h3>
      <div class="demo-box">
        <FireworksCanvas 
          :height="280" 
          :options="{ 
            hue: { min: 0, max: 360 },
            delay: { min: 15, max: 30 }
          }"
        />
      </div>
      <p class="hint">Click anywhere on the canvas to launch more fireworks!</p>
    </div>
  </div>
</template>

<style scoped>
.particles-demo {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 3rem;
}

.demo-box {
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  position: relative;
  background: #111;
}

h2, h3 {
  color: #333;
  margin-bottom: 1rem;
}

.hint {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  margin-top: 0.5rem;
}
</style>
