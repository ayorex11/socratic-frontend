<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Transform PDFs into Learning Resources</h1>
        <p class="hero-subtitle">
          Upload your PDFs, get AI-powered summaries, audio explanations, and interactive quizzes.
          SocraSeek turns any document into an engaging learning experience.
        </p>
        <div class="hero-actions">
          <router-link to="/register" class="cta-button primary"> Start Summarizing </router-link>
          <router-link to="/pricing" class="cta-button secondary"> View Pricing </router-link>
        </div>
      </div>
      <div class="hero-image">
        <img
          src="/hero-reading.png"
          alt="Two students reading together"
          class="hero-illustration"
        />
      </div>
    </section>

    <!-- Workflow Section -->
    <section class="workflow">
      <div class="container">
        <h2 class="section-title">How SocraSeek Works</h2>
        <div class="workflow-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Upload Your PDF</h3>
              <p>
                Upload any PDF document along with optional past questions to guide the
                summarization process.
              </p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>AI Analysis & Summary</h3>
              <p>
                Our AI analyzes your document and generates comprehensive summaries with key
                insights.
              </p>
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
            <p>
              Transform lengthy documents into concise, easy-to-understand summaries with key points
              highlighted.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎵</div>
            <h3>Audio Summaries</h3>
            <p>
              Listen to summaries on the go with our text-to-speech audio versions of your
              documents.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🧩</div>
            <h3>Smart Q&A</h3>
            <p>
              Get question and answer pairs generated from your content to test your understanding.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Interactive Quizzes</h3>
            <p>
              Reinforce learning with automatically generated quizzes based on your summarized
              content.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>Past Question Integration</h3>
            <p>
              Upload past exam questions to guide the AI in focusing on the most relevant content.
            </p>
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
            <p>
              Summarize textbooks, research papers, and lecture notes. Prepare for exams with
              generated quizzes.
            </p>
          </div>
          <div class="use-case">
            <h3>💼 Professionals</h3>
            <p>
              Quickly digest reports, whitepapers, and documentation. Stay informed without spending
              hours reading.
            </p>
          </div>
          <div class="use-case">
            <h3>📚 Researchers</h3>
            <p>
              Process multiple research papers efficiently. Extract key findings and generate study
              aids.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq">
      <div class="container">
        <h2 class="section-title">Frequently Asked Questions</h2>
        <div class="faq-list">
          <div
            v-for="(item, index) in faqItems"
            :key="index"
            class="faq-item"
            :class="{ active: openFaq === index }"
          >
            <button class="faq-question" @click="toggleFaq(index)">
              <span>{{ item.question }}</span>
              <span class="faq-icon">{{ openFaq === index ? '−' : '+' }}</span>
            </button>
            <div class="faq-answer" :class="{ open: openFaq === index }">
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <h2>Ready to Transform Your Reading?</h2>
        <p>Join students and professionals who are learning smarter with SocraSeek summaries.</p>
        <router-link to="/register" class="cta-button primary large">
          Start Summarizing Free
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const openFaq = ref(null)

function toggleFaq(index) {
  openFaq.value = openFaq.value === index ? null : index
}

const faqItems = [
  {
    question: 'What file formats does SocraSeek support?',
    answer:
      'SocraSeek supports both PDF and DOCX files. Simply upload your document and our AI will process it to generate summaries, Q&A pairs, flashcards, audio explanations, and interactive quizzes.',
  },
  {
    question: 'How does the AI summarization work?',
    answer:
      'When you upload a PDF or DOCX file, our AI extracts the text, analyzes the content, and generates a comprehensive summary highlighting key points. You can also upload past exam questions to guide the AI in focusing on the most relevant content.',
  },
  {
    question: 'What learning resources are generated from my PDF?',
    answer:
      'SocraSeek generates multiple resources from a single document: a written summary, question & answer pairs, flashcards for quick review, an audio summary you can listen to on the go, a downloadable PDF report, and an interactive quiz to test your understanding.',
  },
  {
    question: 'Is there a free plan available?',
    answer:
      'Yes! Our Starter plan is completely free and lets you generate summaries with basic features. For longer, more detailed summaries, audio explanations, and additional features, check out our Premium or Student plans.',
  },
  {
    question: 'What is the Student plan?',
    answer:
      'The Student plan offers premium features at a discounted price for students. If your email is from an educational institution (e.g., a .edu or university domain), you may be eligible for the student discount automatically.',
  },
  {
    question: 'Can I browse documents from other users?',
    answer:
      'Yes! SocraSeek has a community feature where you can browse summaries and study materials shared by other users. Free users can access documents from other free users, while Premium users can access all community documents.',
  },
  {
    question: 'How do the interactive quizzes work?',
    answer:
      'After your document is processed, SocraSeek generates a multiple-choice quiz based on the content. You can take the quiz, see your score, and review explanations for each question. Your attempts are tracked so you can monitor your progress over time.',
  },
  {
    question: 'Can I download my summaries and study materials?',
    answer:
      'Absolutely! Premium and Pay-As-You-Use users can download PDF reports of their summaries and audio files of their audio summaries for offline studying. These are available directly from your dashboard.',
  },
]
</script>

<style scoped>
.home {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(16px, 4vw, 20px);
}

/* Hero Section */
.hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(30px, 6vw, 60px);
  align-items: center;
  padding: clamp(40px, 8vw, 80px) clamp(16px, 4vw, 20px);
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.hero-title {
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: clamp(16px, 3vw, 20px);
  line-height: 1.1;
}

.hero-subtitle {
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: #5a6c7d;
  margin-bottom: clamp(24px, 5vw, 40px);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: clamp(12px, 3vw, 20px);
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  padding: clamp(12px, 3vw, 15px) clamp(20px, 4vw, 30px);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
  text-align: center;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
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
  padding: clamp(14px, 3vw, 18px) clamp(24px, 5vw, 40px);
  font-size: clamp(1rem, 3vw, 1.1rem);
  min-height: 60px;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
  order: -1;
}

.hero-illustration {
  width: 100%;
  max-width: clamp(250px, 40vw, 450px);
  height: auto;
  mix-blend-mode: multiply;
}

/* Workflow Section */
.workflow {
  padding: clamp(50px, 8vw, 100px) 0;
  background: #f8f9fa;
}

.section-title {
  text-align: center;
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  color: #2c3e50;
  margin-bottom: clamp(30px, 6vw, 60px);
  line-height: 1.2;
}

.workflow-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: clamp(24px, 5vw, 40px);
}

.step {
  text-align: center;
  position: relative;
}

.step-number {
  width: clamp(50px, 10vw, 60px);
  height: clamp(50px, 10vw, 60px);
  background: #27ae60;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  font-weight: bold;
  margin: 0 auto clamp(16px, 3vw, 20px);
}

.step-content h3 {
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  color: #2c3e50;
  margin-bottom: clamp(12px, 2.5vw, 15px);
  line-height: 1.3;
}

.step-content p {
  color: #5a6c7d;
  line-height: 1.6;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

/* Features Section */
.features {
  padding: clamp(50px, 8vw, 100px) 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: clamp(20px, 4vw, 30px);
}

.feature-card {
  background: white;
  padding: clamp(24px, 5vw, 40px) clamp(20px, 4vw, 30px);
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 280px;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: clamp(2.5rem, 6vw, 3rem);
  margin-bottom: clamp(16px, 3vw, 20px);
}

.feature-card h3 {
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  color: #2c3e50;
  margin-bottom: clamp(12px, 2.5vw, 15px);
  line-height: 1.3;
}

.feature-card p {
  color: #5a6c7d;
  line-height: 1.6;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

/* FAQ Section */
.faq {
  padding: clamp(50px, 8vw, 100px) 0;
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.faq-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.faq-item.active {
  box-shadow: 0 4px 16px rgba(39, 174, 96, 0.15);
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(16px, 3vw, 20px) clamp(20px, 4vw, 24px);
  background: none;
  border: none;
  cursor: pointer;
  font-size: clamp(0.95rem, 2.5vw, 1.05rem);
  font-weight: 600;
  color: #2c3e50;
  text-align: left;
  gap: 16px;
  transition: color 0.2s ease;
}

.faq-question:hover {
  color: #27ae60;
}

.faq-icon {
  font-size: 1.4rem;
  font-weight: 700;
  color: #27ae60;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.faq-item.active .faq-icon {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition:
    max-height 0.35s ease,
    padding 0.35s ease;
  padding: 0 clamp(20px, 4vw, 24px);
}

.faq-answer.open {
  max-height: 300px;
  padding: 0 clamp(20px, 4vw, 24px) clamp(16px, 3vw, 20px);
}

.faq-answer p {
  color: #5a6c7d;
  line-height: 1.7;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  margin: 0;
}

/* Use Cases Section */
.use-cases {
  padding: clamp(50px, 8vw, 100px) 0;
  background: #f8f9fa;
}

.use-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: clamp(24px, 5vw, 40px);
}

.use-case {
  background: white;
  padding: clamp(24px, 5vw, 40px) clamp(20px, 4vw, 30px);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  min-height: 200px;
}

.use-case h3 {
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  color: #2c3e50;
  margin-bottom: clamp(12px, 2.5vw, 15px);
  line-height: 1.3;
}

.use-case p {
  color: #5a6c7d;
  line-height: 1.6;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

/* CTA Section */
.cta-section {
  padding: clamp(50px, 8vw, 80px) 0;
  background: #27ae60;
  color: white;
  text-align: center;
}

.cta-section h2 {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  margin-bottom: clamp(16px, 3vw, 20px);
  line-height: 1.2;
}

.cta-section p {
  font-size: clamp(1rem, 3vw, 1.2rem);
  margin-bottom: clamp(24px, 5vw, 40px);
  opacity: 0.9;
  line-height: 1.4;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Tablet and Desktop Layout */
@media (min-width: 768px) {
  .hero {
    grid-template-columns: 1fr 1fr;
    text-align: left;
    gap: clamp(40px, 6vw, 60px);
  }

  .hero-image {
    order: 1;
  }

  .hero-actions {
    justify-content: flex-start;
  }

  .workflow-steps {
    grid-template-columns: repeat(4, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .use-cases-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop Enhancements */
@media (min-width: 1200px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Small Mobile Optimizations */
@media (max-width: 480px) {
  .hero {
    padding: 30px 16px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .cta-button {
    width: 100%;
    max-width: 280px;
  }

  .feature-card,
  .use-case {
    min-height: auto;
    padding: 20px 16px;
  }

  .workflow-steps {
    gap: 20px;
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .cta-button,
  .feature-card {
    transition: none;
  }

  .cta-button:hover,
  .feature-card:hover {
    transform: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .home {
    background: #121212;
  }

  .hero {
    background: #121212;
  }

  .hero-title {
    color: #27ae60;
  }

  .hero-subtitle {
    color: #b0b0b0;
  }

  .section-title {
    color: #27ae60;
  }

  .step-content h3,
  .feature-card h3,
  .use-case h3 {
    color: #2ecc71;
  }

  .step-content p,
  .feature-card p,
  .use-case p {
    color: #b0b0b0;
  }

  .workflow,
  .use-cases {
    background: #1a1a1a;
  }

  .features {
    background: #121212;
  }

  .feature-card,
  .use-case {
    background: #2d2d2d;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  .faq {
    background: #121212;
  }

  .faq-item {
    background: #2d2d2d;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .faq-item:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .faq-item.active {
    box-shadow: 0 4px 16px rgba(46, 204, 113, 0.2);
  }

  .faq-question {
    color: #e0e0e0;
  }

  .faq-question:hover {
    color: #2ecc71;
  }

  .faq-icon {
    color: #2ecc71;
  }

  .faq-answer p {
    color: #b0b0b0;
  }

  .cta-button.secondary {
    color: #2ecc71;
    border-color: #2ecc71;
  }

  .cta-button.secondary:hover {
    background: #2ecc71;
    color: #121212;
  }

  .hero-image {
    background: #ffffff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 24px rgba(39, 174, 96, 0.15);
  }

  .hero-illustration {
    mix-blend-mode: multiply;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .feature-card,
  .use-case {
    border: 2px solid #000;
  }

  .cta-button {
    border: 2px solid #000;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .cta-button:hover,
  .feature-card:hover {
    transform: none;
  }

  .cta-button:active,
  .feature-card:active {
    transform: scale(0.98);
  }
}

/* Landscape mode for mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .hero {
    padding: 30px 20px;
    grid-template-columns: 2fr 1fr;
    align-items: center;
  }

  .hero-title {
    font-size: 1.8rem;
    margin-bottom: 12px;
  }

  .hero-subtitle {
    font-size: 0.9rem;
    margin-bottom: 20px;
  }

  .hero-actions {
    gap: 10px;
  }

  .cta-button {
    min-height: 44px;
    padding: 10px 20px;
    font-size: 0.9rem;
  }

  .placeholder-image {
    font-size: 4rem;
  }
}

/* Print styles */
@media print {
  .hero-actions,
  .cta-section {
    display: none;
  }

  .hero,
  .workflow,
  .features,
  .use-cases {
    padding: 20px 0;
  }

  .feature-card,
  .use-case {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}
</style>
