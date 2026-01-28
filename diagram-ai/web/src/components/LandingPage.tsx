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
                <div className="landing-nav-links">
                    <a href="#giris">Giriş & Kayıt</a>
                    <a href="#odeme">Ödeme</a>
                    <a href="#ozellikler">Özellikler</a>
                </div>
                <button className="landing-cta-small" onClick={onEnterApp}>
                    Uygulamaya Git →
                </button>
            </nav>

            {/* Hero Section */}
            <section className="landing-hero" id="hero">
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
                        <a className="landing-cta-secondary" href="#giris">
                            Hemen Kayıt Ol
                        </a>
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
            {/* Auth Section */}
            <section className="landing-auth" id="giris">
                <div className="section-header">
                    <h2 className="section-title">Hesabına Giriş Yap veya Kayıt Ol</h2>
                    <p className="section-subtitle">
                        Tek tıkla Google hesabınla kayıt olabilir, güvenli bir şekilde giriş yapabilirsin.
                    </p>
                </div>
                <div className="auth-grid">
                    <div className="auth-card">
                        <h3>Giriş Yap</h3>
                        <form className="auth-form">
                            <label className="input-group">
                                E-posta
                                <input type="email" placeholder="ornek@diagram.ai" />
                            </label>
                            <label className="input-group">
                                Şifre
                                <input type="password" placeholder="••••••••" />
                            </label>
                            <div className="form-row">
                                <label className="checkbox">
                                    <input type="checkbox" /> Beni hatırla
                                </label>
                                <button type="button" className="text-link">Şifremi unuttum</button>
                            </div>
                            <button type="button" className="landing-cta-primary full-width">
                                Giriş Yap
                            </button>
                        </form>
                    </div>
                    <div className="auth-card accent">
                        <h3>Kayıt Ol</h3>
                        <form className="auth-form">
                            <label className="input-group">
                                Ad Soyad
                                <input type="text" placeholder="Ada Lovelace" />
                            </label>
                            <label className="input-group">
                                E-posta
                                <input type="email" placeholder="ornek@diagram.ai" />
                            </label>
                            <label className="input-group">
                                Şifre
                                <input type="password" placeholder="En az 8 karakter" />
                            </label>
                            <button type="button" className="landing-cta-primary full-width">
                                Kayıt Ol
                            </button>
                            <div className="divider">
                                <span>veya</span>
                            </div>
                            <button type="button" className="google-button">
                                <span className="google-icon">G</span>
                                Google ile Kayıt Ol
                            </button>
                            <p className="helper-text">
                                Google hesabınla hızlı ve güvenli kayıt.
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* Payment Section */}
            <section className="landing-payment" id="odeme">
                <div className="section-header">
                    <h2 className="section-title">Ödeme Bilgileri</h2>
                    <p className="section-subtitle">
                        Planını seç, ödeme bilgilerini ekle ve 7 günlük ücretsiz denemeye hemen başla.
                    </p>
                </div>
                <div className="payment-grid">
                    <div className="payment-card">
                        <h3>Plan Seçimi</h3>
                        <div className="plan-option active">
                            <div>
                                <strong>Pro</strong>
                                <p>Sınırsız diyagram, ekip paylaşımı</p>
                            </div>
                            <span className="plan-price">₺249/ay</span>
                        </div>
                        <div className="plan-option">
                            <div>
                                <strong>Takım</strong>
                                <p>Gelişmiş izinler, sınırsız proje</p>
                            </div>
                            <span className="plan-price">₺499/ay</span>
                        </div>
                        <ul className="plan-benefits">
                            <li>7 gün ücretsiz deneme</li>
                            <li>İstediğin zaman iptal</li>
                            <li>Fatura ve şirket bilgisi ekleme</li>
                        </ul>
                    </div>
                    <div className="payment-card">
                        <h3>Kart Bilgileri</h3>
                        <form className="auth-form">
                            <label className="input-group">
                                Kart Üzerindeki İsim
                                <input type="text" placeholder="Ada Lovelace" />
                            </label>
                            <label className="input-group">
                                Kart Numarası
                                <input type="text" placeholder="1234 5678 9012 3456" />
                            </label>
                            <div className="form-row">
                                <label className="input-group">
                                    Son Kullanma
                                    <input type="text" placeholder="AA/YY" />
                                </label>
                                <label className="input-group">
                                    CVV
                                    <input type="text" placeholder="123" />
                                </label>
                            </div>
                            <label className="input-group">
                                Fatura Adresi
                                <input type="text" placeholder="İstanbul, Türkiye" />
                            </label>
                        </form>
                    </div>
                    <div className="payment-card">
                        <h3>Güvenli Ödeme</h3>
                        <div className="security-list">
                            <div className="security-item">
                                <span>🔒</span>
                                <div>
                                    <strong>PCI DSS Uyumlu</strong>
                                    <p>Kart bilgileri şifreli olarak işlenir.</p>
                                </div>
                            </div>
                            <div className="security-item">
                                <span>✅</span>
                                <div>
                                    <strong>3D Secure</strong>
                                    <p>Ek doğrulama ile güvenli ödeme.</p>
                                </div>
                            </div>
                            <div className="security-item">
                                <span>⚡</span>
                                <div>
                                    <strong>Anında Aktivasyon</strong>
                                    <p>Ödemenin ardından hesabın hemen aktif olur.</p>
                                </div>
                            </div>
                        </div>
                        <button type="button" className="landing-cta-primary full-width">
                            Ödemeyi Tamamla
                        </button>
                        <p className="helper-text">Ödemeniz ay sonunda otomatik yenilenir.</p>
                    </div>
                </div>
            </section>

            <section className="landing-features" id="ozellikler">
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
            <section className="landing-how" id="nasil">
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
