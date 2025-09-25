
'use client';

import { useRouter } from 'next/navigation';

export default function DoctorPaymentPage() {
    const router = useRouter();

    const handlePlanSelection = () => {
        // In a real app, this would integrate with a payment provider.
        // For now, we'll simulate a successful selection and redirect to the signup/login page.
        router.push('/login?role=doctor');
    };

    return (
        <>
            <style jsx global>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .doctor-payment-body {
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
                    max-width: 1200px;
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
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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
                    border: 2px solid #10B981;
                    transform: scale(1.05);
                }

                .plan-card.popular::before {
                    content: "Most Popular";
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
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
                    font-size: 2.8rem;
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

                .professional-info {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 1.5rem;
                    margin-top: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .professional-info h3 {
                    font-size: 1.2rem;
                    margin-bottom: 1rem;
                    color: #A78BFA;
                }

                .professional-features {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .professional-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 0.9rem;
                }

                .savings-badge {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
                    color: white;
                    padding: 0.3rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .best-value-badge {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
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
                    
                    .professional-features {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: center;
                    }
                }
            `}</style>
            <div className="doctor-payment-body">
                <div className="payment-container">
                    <div className="payment-header">
                        <h1>Doctor Professional Plans</h1>
                        <p>Choose the perfect plan for your dermatology practice and patient management</p>
                    </div>

                    <div className="plans-grid">
                        {/* Monthly Plan */}
                        <div className="plan-card">
                            <div className="plan-icon">🩺</div>
                            <div className="plan-price">
                                <span className="plan-currency">₹</span>1
                            </div>
                            <div className="plan-duration">Per Month</div>
                            <div className="plan-title">Starter Practice</div>
                            <div className="plan-description">Perfect for new practitioners or small clinics starting with AI-assisted diagnosis</div>
                            
                            <ul className="plan-features">
                                <li>Up to 50 patient analyses/month</li>
                                <li>AI report verification</li>
                                <li>Basic patient management</li>
                                <li>WhatsApp consultation</li>
                                <li>Standard support</li>
                                <li>Mobile app access</li>
                                <li>Basic analytics</li>
                            </ul>
                            
                            <button className="plan-btn" onClick={handlePlanSelection}>Start Trial</button>
                        </div>

                        {/* 6 Month Plan */}
                        <div className="plan-card popular">
                            <div className="savings-badge">Save 50%</div>
                            <div className="plan-icon">⭐</div>
                            <div className="plan-price">
                                <span className="plan-currency">₹</span>999
                            </div>
                            <div className="plan-duration">6 Months</div>
                            <div className="plan-title">Professional Practice</div>
                            <div className="plan-description">Ideal for established practitioners looking to scale their practice with AI</div>
                            
                            <ul className="plan-features">
                                <li>Up to 200 patient analyses/month</li>
                                <li>Advanced AI verification tools</li>
                                <li>Complete patient records</li>
                                <li>Priority consultation queue</li>
                                <li>24/7 priority support</li>
                                <li>Custom prescription templates</li>
                                <li>Advanced analytics dashboard</li>
                                <li>Multi-clinic management</li>
                            </ul>
                            
                            <button className="plan-btn" onClick={handlePlanSelection}>Choose Plan</button>
                        </div>

                        {/* Annual Plan */}
                        <div className="plan-card">
                            <div className="best-value-badge">Best Value</div>
                            <div className="plan-icon">👨‍⚕️</div>
                            <div className="plan-price">
                                <span className="plan-currency">₹</span>3999
                            </div>
                            <div className="plan-duration">Full Year</div>
                            <div className="plan-title">Enterprise Practice</div>
                            <div className="plan-description">Complete solution for large practices, hospitals, and dermatology centers</div>
                            
                            <ul className="plan-features">
                                <li>Unlimited patient analyses</li>
                                <li>AI-powered diagnostic assistance</li>
                                <li>Complete EHR integration</li>
                                <li>Instant consultation access</li>
                                <li>Dedicated account manager</li>
                                <li>Custom branding options</li>
                                <li>Advanced reporting & insights</li>
                                <li>Multi-location support</li>
                                <li>API access for integrations</li>
                                <li>Training & onboarding</li>
                            </ul>
                            
                            <button className="plan-btn" onClick={handlePlanSelection}>Contact Sales</button>
                        </div>
                    </div>

                    <div className="professional-info">
                        <h3>🏥 Professional Benefits</h3>
                        <div className="professional-features">
                            <div className="professional-item">
                                <span>👨‍⚕️</span>
                                <span>Medical License Verified</span>
                            </div>
                            <div className="professional-item">
                                <span>📊</span>
                                <span>Patient Analytics</span>
                            </div>
                            <div className="professional-item">
                                <span>🔒</span>
                                <span>HIPAA Compliant</span>
                            </div>
                            <div className="professional-item">
                                <span>💼</span>
                                <span>Practice Management</span>
                            </div>
                            <div className="professional-item">
                                <span>📱</span>
                                <span>Mobile & Desktop Apps</span>
                            </div>
                            <div className="professional-item">
                                <span>🎓</span>
                                <span>Continuing Education Credits</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
