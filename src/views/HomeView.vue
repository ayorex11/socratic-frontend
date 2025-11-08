<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Transform PDFs into Learning Resources</h1>
        <p class="hero-subtitle">
          Upload your PDFs, get AI-powered summaries, audio explanations, and interactive quizzes.
          Socratic turns any document into an engaging learning experience.
        </p>
        <div class="hero-actions">
          <router-link to="/register" class="cta-button primary">
            Start Summarizing
          </router-link>
          <router-link to="/pricing" class="cta-button secondary">
            View Pricing
          </router-link>
        </div>
      </div>
      <div class="hero-image">
        <div class="placeholder-image">
          📚
        </div>
      </div>
    </section>

    <!-- Workflow Section -->
    <section class="workflow">
      <div class="container">
        <h2 class="section-title">How Socratic Works</h2>
        <div class="workflow-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Upload Your PDF</h3>
              <p>Upload any PDF document along with optional past questions to guide the summarization process.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>AI Analysis & Summary</h3>
              <p>Our AI analyzes your document and generates comprehensive summaries with key insights.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Download Resources</h3>
              <p>Get downloadable PDF summaries and audio explanations for learning on the go.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>Test Your Knowledge</h3>
              <p>Take interactive quizzes generated from your summary to reinforce learning.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Powerful Learning Tools</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📄</div>
            <h3>PDF Summarization</h3>
            <p>Transform lengthy documents into concise, easy-to-understand summaries with key points highlighted.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎵</div>
            <h3>Audio Summaries</h3>
            <p>Listen to summaries on the go with our text-to-speech audio versions of your documents.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🧩</div>
            <h3>Smart Q&A</h3>
            <p>Get question and answer pairs generated from your content to test your understanding.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Interactive Quizzes</h3>
            <p>Reinforce learning with automatically generated quizzes based on your summarized content.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>Past Question Integration</h3>
            <p>Upload past exam questions to guide the AI in focusing on the most relevant content.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📥</div>
            <h3>Downloadable Resources</h3>
            <p>Export your summaries, Q&A, and quizzes for offline study and sharing.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Use Cases -->
    <section class="use-cases">
      <div class="container">
        <h2 class="section-title">Perfect For</h2>
        <div class="use-cases-grid">
          <div class="use-case">
            <h3>🎓 Students</h3>
            <p>Summarize textbooks, research papers, and lecture notes. Prepare for exams with generated quizzes.</p>
          </div>
          <div class="use-case">
            <h3>💼 Professionals</h3>
            <p>Quickly digest reports, whitepapers, and documentation. Stay informed without spending hours reading.</p>
          </div>
          <div class="use-case">
            <h3>📚 Researchers</h3>
            <p>Process multiple research papers efficiently. Extract key findings and generate study aids.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <h2>Ready to Transform Your Reading?</h2>
        <p>Join students and professionals who are learning smarter with Socratic summaries.</p>
        <router-link to="/register" class="cta-button primary large">
          Start Summarizing Free
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
// Component logic can go here
</script>

<style scoped>
.home {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 20px;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #5a6c7d;
  margin-bottom: 40px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 20px;
}

.cta-button {
  padding: 15px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
}

.cta-button.primary {
  background: #27ae60;
  color: white;
}

.cta-button.primary:hover {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(39, 174, 96, 0.3);
}

.cta-button.secondary {
  background: transparent;
  color: #27ae60;
  border: 2px solid #27ae60;
}

.cta-button.secondary:hover {
  background: #27ae60;
  color: white;
  transform: translateY(-2px);
}

.cta-button.large {
  padding: 18px 40px;
  font-size: 1.1rem;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder-image {
  font-size: 8rem;
  opacity: 0.8;
}

/* Workflow Section */
.workflow {
  padding: 100px 0;
  background: #f8f9fa;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 60px;
}

.workflow-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.step {
  text-align: center;
  position: relative;
}

.step-number {
  width: 60px;
  height: 60px;
  background: #27ae60;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto 20px;
}

.step-content h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.step-content p {
  color: #5a6c7d;
  line-height: 1.6;
}

/* Features Section */
.features {
  padding: 100px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.feature-card p {
  color: #5a6c7d;
  line-height: 1.6;
}

/* Use Cases Section */
.use-cases {
  padding: 100px 0;
  background: #f8f9fa;
}

.use-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.use-case {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.use-case h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.use-case p {
  color: #5a6c7d;
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: 80px 0;
  background: #27ae60;
  color: white;
  text-align: center;
}

.cta-section h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.cta-section p {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 60px 20px;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .workflow-steps {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
