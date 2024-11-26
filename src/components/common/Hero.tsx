import './Hero.css';

export default function Hero() {
  return (
    <>
      <div className="background-dots">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`dot dot-${i + 1}`} />
        ))}
      </div>
      
      <div className="hero-section">
        <h1 className="hero-title">Easy Planning Poker</h1>
        <p className="hero-subtitle">
        Never Any Stress, Seamlessly Integrated Management. Plan smarter, execute faster.
        </p>
      </div>
    </>
  );
} 