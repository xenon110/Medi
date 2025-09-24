
'use client';

import { useRouter } from 'next/navigation';

export default function PaymentPage() {
    const router = useRouter();

    const handlePlanSelection = () => {
        // In a real app, this would integrate with a payment provider like Stripe or Razorpay.
        // For now, we'll simulate a successful payment and redirect to the login/signup page.
        router.push('/login?role=patient');
    };

    return (
        <>
            <style jsx global>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .payment-page-body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background: linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%);
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .payment-container {
                    max-width: 1000px;
                    width: 100%;
                    text-align: center;
                }

                .payment-header {
                    margin-bottom: 3rem;
                }

                .payment-header h1 {
                    font-size: 2.5rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: #A78BFA;
                }

                .payment-header p {
                    font-size: 1.1rem;
                    color: rgba(255, 255, 255, 0.8);
                }

                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3rem;
                }

                .plan-card {
                    background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
                    border: 1px solid rgba(168, 85, 247, 0.4);
                    border-radius: 20px;
                    padding: 2rem;
                    transition: all 0.3s;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }

                .plan-card:hover {
                    transform: translateY(-8px);
                    border-color: #A78BFA;
                    box-shadow: 0 20px 40px rgba(168, 85, 247, 0.2);
                }

                .plan-card.popular {
                    border: 2px solid #A78BFA;
                    transform: scale(1.05);
                }

                .plan-card.popular::before {
                    content: "Most Popular";
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-bottom-left-radius: 15px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .plan-icon {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    font-size: 1.5rem;
                }

                .plan-price {
                    font-size: 3rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 0.5rem;
                }

                .plan-currency {
                    font-size: 1.2rem;
                    color: #A78BFA;
                    margin-right: 0.2rem;
                }

                .plan-duration {
                    color: #A78BFA;
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                    font-weight: 500;
                }

                .plan-title {
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: white;
                }

                .plan-description {
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 2rem;
                    line-height: 1.5;
                }

                .plan-features {
                    list-style: none;
                    text-align: left;
                    margin-bottom: 2rem;
                    padding-left: 0;
                }

                .plan-features li {
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    font-size: 0.95rem;
                }

                .plan-features li::before {
                    content: "✓";
                    color: #A78BFA;
                    font-weight: bold;
                    width: 20px;
                    height: 20px;
                    background: rgba(167, 139, 250, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    flex-shrink: 0;
                }

                .plan-btn {
                    width: 100%;
                    padding: 1rem;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
                    color: white;
                }

                .plan-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(167, 139, 250, 0.4);
                }

                .plan-card.popular .plan-btn {
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                }

                .security-info {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 1.5rem;
                    margin-top: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .security-info h3 {
                    font-size: 1.2rem;
                    margin-bottom: 1rem;
                    color: #A78BFA;
                }

                .security-features {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .security-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 0.9rem;
                }
                
                .security-item span:first-child {
                    font-size: 1.2rem;
                }

                .savings-badge {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    color: white;
                    padding: 0.3rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                @media (max-width: 768px) {
                    .payment-header h1 {
                        font-size: 2rem;
                    }
                    
                    .plans-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    
                    .plan-card.popular {
                        transform: none;
                    }
                    
                    .security-features {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: center;
                    }
                }
            `}</style>
            <div className="payment-page-body">
                <div className="payment-container">
                    <div className="payment-header">
                        <h1>Choose Your Plan</h1>
                        <p>Get AI-powered skin analysis with professional dermatologist verification</p>
                    </div>

                    <div className="plans-grid">
                        {/* Single Use Plan */}
                        <div className="plan-card" onClick={handlePlanSelection}>
                            <div className="plan-icon">🔬</div>
                            <div className="plan-price">
                                <span className="plan-currency">₹</span>49
                            </div>
                            <div className="plan-duration">Single Analysis</div>
                            <div className="plan-title">One-Time Use</div>
                            <div className="plan-description">Perfect for trying our AI skin analysis service</div>
                            
                            <ul className="plan-features">
                                <li>1 AI skin analysis</li>
                                <li>Basic skin report</li>
                                <li>Home care recommendations</li>
                                <li>24-hour support</li>
                                <li>Secure & private</li>
                            </ul>
                            
                            <button className="plan-btn">Start Analysis</button>
                        </div>

                        {/* 22 Days Plan */}
                        <div className="plan-card popular" onClick={handlePlanSelection}>
                            <div className="savings-badge">Save 67%</div>
                            <div className="plan-icon">⭐</div>
                            <div className="plan-price">
                                <span className="plan-currency">₹</span>249
                            </div>
                            <div className="plan-duration">22 Days Access</div>
                            <div className="plan-title">Short Term Plan</div>
                            <div className="plan-description">Great for monitoring skin improvements over 3 weeks</div>
                            
                            <ul className="plan-features">
                                <li>Unlimited AI analyses</li>
                                <li>Progress tracking</li>
                                <li>Doctor consultations</li>
                                <li>Personalized treatments</li>
                                <li>WhatsApp support</li>
                                <li>Multi-language support</li>
                            </ul>
                            
                            <button className="plan-btn">Get Started</button>
                        </div>

                        {/* 1 Month Plan */}
                        <div className="plan-card" onClick={handlePlanSelection}>
                            <div className="savings-badge">Best Value</div>
                            <div className="plan-icon">👨‍⚕️</div>
                            <div className="plan-price">
                                <span className="plan-currency">₹</span>499
                            </div>
                            <div className="plan-duration">Full Month</div>
                            <div className="plan-title">Complete Care</div>
                            <div className="plan-description">Comprehensive skin health monitoring with full doctor access</div>
                            
                            <ul className="plan-features">
                                <li>Unlimited AI analyses</li>
                                <li>Full progress tracking</li>
                                <li>Priority doctor access</li>
                                <li>Custom treatment plans</li>
                                <li>24/7 premium support</li>
                                <li>Advanced reporting</li>
                                <li>Export medical records</li>
                            </ul>
                            
                            <button className="plan-btn">Choose Plan</button>
                        </div>
                    </div>

                    <div className="security-info">
                        <h3>🔒 Your Security & Privacy</h3>
                        <div className="security-features">
                            <div className="security-item">
                                <span>🛡️</span>
                                <span>HIPAA Compliant</span>
                            </div>
                            <div className="security-item">
                                <span>🔐</span>
                                <span>End-to-End Encrypted</span>
                            </div>
                            <div className="security-item">
                                <span>💳</span>
                                <span>Secure Payment</span>
                            </div>
                            <div className="security-item">
                                <span>↩️</span>
                                <span>7-Day Money Back</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
