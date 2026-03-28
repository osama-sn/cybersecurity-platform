import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Trophy, Medal, User, Award, Crown, Loader } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LeaderboardView = ({ sectionId }) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isRTL, t } = useLanguage();

  useEffect(() => {
    if (!sectionId) return;

    setLoading(true);
    const leaderboardsRef = collection(db, 'leaderboards');
    const q = query(
      leaderboardsRef,
      where('sectionId', '==', sectionId),
      orderBy('score', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaders(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaderboard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sectionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-cyber-500 animate-pulse">
        <Loader className="animate-spin mb-4" size={32} />
        <p>Loading Leaderboard...</p>
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-cyber-500 bg-cyber-900/20 rounded-2xl border border-cyber-800/50 backdrop-blur-sm">
        <Trophy size={48} className="text-cyber-700 mb-4 opacity-50" />
        <p>No scores recorded yet for this section.</p>
        <p className="text-sm mt-2 opacity-60">Be the first to solve a challenge and claim the top spot!</p>
      </div>
    );
  }

  const getRankStyle = (index) => {
    switch (index) {
      case 0:
        return {
          bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/5',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          icon: <Crown className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" size={24} />,
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        };
      case 1:
        return {
          bg: 'bg-gradient-to-r from-slate-300/10 to-transparent',
          border: 'border-slate-300/30',
          text: 'text-slate-300',
          icon: <Medal className="text-slate-300" size={24} />,
          badge: 'bg-slate-300/10 text-slate-300 border-slate-300/20'
        };
      case 2:
        return {
          bg: 'bg-gradient-to-r from-amber-700/20 to-transparent',
          border: 'border-amber-700/40',
          text: 'text-amber-600',
          icon: <Medal className="text-amber-600" size={24} />,
          badge: 'bg-amber-700/20 text-amber-500 border-amber-700/30'
        };
      default:
        return {
          bg: 'bg-cyber-900/30',
          border: 'border-cyber-800',
          text: 'text-cyber-300',
          icon: <span className="text-lg font-bold text-cyber-500 w-6 text-center">{index + 1}</span>,
          badge: 'bg-cyber-800/50 text-cyber-400 border-cyber-700'
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-cyber-900/50 rounded-2xl border border-cyber-800 backdrop-blur-md mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
            <Trophy className="text-emerald-400" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Section Leaderboard</h2>
            <p className="text-sm text-cyber-400">Top hackers by challenge points</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {leaders.map((user, index) => {
          const style = getRankStyle(index);
          const isTop3 = index < 3;

          return (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${style.bg} ${style.border}`}
            >
              <div className="flex items-center gap-4 hidden-scroll">
                <div className="flex items-center justify-center w-10 h-10 shrink-0">
                  {style.icon}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0 ${isTop3 ? style.border : 'border-cyber-700 bg-cyber-800'}`}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className={style.text} />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold ${isTop3 ? style.text : 'text-cyber-100'} text-lg leading-tight truncate max-w-[150px] sm:max-w-xs`}>
                      {user.displayName}
                    </h3>
                    <p className="text-xs text-cyber-500">Rank #{index + 1}</p>
                  </div>
                </div>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-inner ${style.badge}`}>
                <Award size={18} className="opacity-80" />
                <span className="font-mono font-bold text-lg">{user.score}</span>
                <span className="text-xs uppercase tracking-wider opacity-70 mt-1">pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardView;
