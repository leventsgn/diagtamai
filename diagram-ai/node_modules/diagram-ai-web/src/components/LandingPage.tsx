import React from "react";

interface LandingPageProps {
    onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
    return (
        <div className="landing">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-logo">✨ Diagram AI</div>
                <button className="landing-cta-small" onClick={onEnterApp}>
                    Uygulamaya Git →
                </button>
            </nav>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-content">
                    <h1 className="landing-title">
                        Yapay Zeka ile <span className="gradient-text">Profesyonel Diyagramlar</span>
                    </h1>
                    <p className="landing-subtitle">
                        Sistem mimarisi, akış şemaları ve teknik diyagramlarınızı saniyeler içinde oluşturun. Türkçe komutlarla çalışın, AI gücüyle üretin.
                    </p>
                    <div className="landing-cta-group">
                        <button className="landing-cta-primary" onClick={onEnterApp}>
                            Ücretsiz Başla
                        </button>
                        <button className="landing-cta-secondary">
                            Demo İzle
                        </button>
                    </div>
                </div>
                <div className="landing-hero-visual">
                    <div className="hero-diagram-preview">
                        <div className="preview-node node-1">API Gateway</div>
                        <div className="preview-node node-2">Microservice</div>
                        <div className="preview-node node-3">Database</div>
                        <div className="preview-edge edge-1"></div>
                        <div className="preview-edge edge-2"></div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features">
                <h2 className="section-title">Neden Diagram AI?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>AI Destekli Üretim</h3>
                        <p>Türkçe talimatlarınızı anlayan yapay zeka, profesyonel diyagramlar oluşturur.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Hızlı ve Verimli</h3>
                        <p>Saatler süren manuel çizim işlerini dakikalara indirin.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎨</div>
                        <h3>Profesyonel Tasarım</h3>
                        <p>Kurumsal sunumlara hazır, modern ve şık görünüm.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📤</div>
                        <h3>Kolay Export</h3>
                        <p>PNG formatında yüksek kaliteli dışa aktarım.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔧</div>
                        <h3>Tam Kontrol</h3>
                        <p>Oluşturulan diyagramları sürükle-bırak ile düzenleyin.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🌐</div>
                        <h3>100+ Bileşen</h3>
                        <p>Cloud, DevOps, Database ve daha fazlası için hazır ikonlar.</p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="landing-how">
                <h2 className="section-title">Nasıl Çalışır?</h2>
                <div className="how-steps">
                    <div className="how-step">
                        <div className="step-number">1</div>
                        <h3>Tanımlayın</h3>
                        <p>Ne tür bir diyagram istediğinizi Türkçe olarak yazın.</p>
                    </div>
                    <div className="how-arrow">→</div>
                    <div className="how-step">
                        <div className="step-number">2</div>
                        <h3>Oluşturun</h3>
                        <p>AI, isteğinizi analiz ederek profesyonel diyagram üretir.</p>
                    </div>
                    <div className="how-arrow">→</div>
                    <div className="how-step">
                        <div className="step-number">3</div>
                        <h3>Düzenleyin</h3>
                        <p>Gerekirse düzenleyin ve PNG olarak indirin.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="landing-logo">✨ Diagram AI</span>
                        <p>Yapay zeka destekli diyagram oluşturma aracı.</p>
                    </div>
                    <div className="footer-links">
                        <a href="#">Gizlilik Politikası</a>
                        <a href="#">Kullanım Koşulları</a>
                        <a href="#">İletişim</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    © 2026 Diagram AI. Tüm hakları saklıdır.
                </div>
            </footer>
        </div>
    );
}
