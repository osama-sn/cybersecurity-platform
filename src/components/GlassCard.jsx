const GlassCard = ({ className = '', children }) => {
  return (
    <div
      className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
