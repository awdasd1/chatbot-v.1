import React, { useEffect, useState } from 'react';
import { useLogto, type IdTokenClaims } from '@logto/react';
import { MessageCircle, Sparkles, Zap, Shield, ArrowRight, User, LogOut } from 'lucide-react';
import WelcomePage from '../../components/WelcomePage';
import ChatBot from '../../components/ChatBot';

const Home = () => {
  const { signIn, signOut, isAuthenticated, getIdTokenClaims } = useLogto();
  const [user, setUser] = useState<IdTokenClaims>();
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        const claims = await getIdTokenClaims();
        setUser(claims);
      }
    })();
  }, [getIdTokenClaims, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-300/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo and Title */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 glass-effect">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                تشات بوت ذكي
                <span className="block text-3xl md:text-4xl font-normal mt-2 text-white/80">
                  AI Chatbot
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                تجربة محادثة ذكية مع أحدث نماذج الذكاء الاصطناعي
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="glass-effect rounded-2xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">ذكاء متقدم</h3>
                <p className="text-white/70 text-sm">نماذج ذكاء اصطناعي متطورة للإجابة على جميع أسئلتك</p>
              </div>

              <div className="glass-effect rounded-2xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">سرعة فائقة</h3>
                <p className="text-white/70 text-sm">استجابة فورية وسريعة لجميع استفساراتك</p>
              </div>

              <div className="glass-effect rounded-2xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">آمان وخصوصية</h3>
                <p className="text-white/70 text-sm">محادثاتك محمية ومشفرة بأعلى معايير الأمان</p>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={() => signIn('https://chatbot.mja.lat/callback')}
              className="group inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 glass-effect hover:scale-105 hover:shadow-2xl"
            >
              تسجيل الدخول
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10+</div>
                <div className="text-white/70 text-sm">نماذج ذكية</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-white/70 text-sm">متاح دائماً</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">∞</div>
                <div className="text-white/70 text-sm">إمكانيات لا محدودة</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!showChat ? (
        <div className="min-h-screen gradient-bg relative overflow-hidden">
          {/* Header with user info and sign out */}
          <div className="relative z-10 p-6">
            <div className="flex justify-between items-center max-w-6xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center glass-effect">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <div className="font-semibold">
                    {user?.name || user?.email || 'مستخدم'}
                  </div>
                  <div className="text-sm text-white/70">مرحباً بك</div>
                </div>
              </div>
              <button
                onClick={() => signOut('https://chatbot.mja.lat/')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all duration-300 glass-effect"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-300/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-0">
            <div className="max-w-4xl mx-auto text-center">
              {/* Logo and Title */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 glass-effect">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                  تشات بوت ذكي
                  <span className="block text-3xl md:text-4xl font-normal mt-2 text-white/80">
                    AI Chatbot
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                  تجربة محادثة ذكية مع أحدث نماذج الذكاء الاصطناعي
                </p>
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="glass-effect rounded-2xl p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">ذكاء متقدم</h3>
                  <p className="text-white/70 text-sm">نماذج ذكاء اصطناعي متطورة للإجابة على جميع أسئلتك</p>
                </div>

                <div className="glass-effect rounded-2xl p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">سرعة فائقة</h3>
                  <p className="text-white/70 text-sm">استجابة فورية وسريعة لجميع استفساراتك</p>
                </div>

                <div className="glass-effect rounded-2xl p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">آمان وخصوصية</h3>
                  <p className="text-white/70 text-sm">محادثاتك محمية ومشفرة بأعلى معايير الأمان</p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setShowChat(true)}
                className="group inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 glass-effect hover:scale-105 hover:shadow-2xl"
              >
                ابدأ المحادثة الآن
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              {/* User Info Table */}
              {user && (
                <div className="mt-12 max-w-2xl mx-auto">
                  <h3 className="text-xl font-semibold text-white mb-4">معلومات المستخدم</h3>
                  <div className="glass-effect rounded-2xl p-6 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-white font-semibold py-2 px-4">الخاصية</th>
                          <th className="text-white font-semibold py-2 px-4">القيمة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(user).map(([key, value]) => (
                          <tr key={key} className="border-b border-white/10">
                            <td className="text-white/80 py-2 px-4 font-medium">{key}</td>
                            <td className="text-white/70 py-2 px-4 break-all">
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10+</div>
                  <div className="text-white/70 text-sm">نماذج ذكية</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-white/70 text-sm">متاح دائماً</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">∞</div>
                  <div className="text-white/70 text-sm">إمكانيات لا محدودة</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ChatBot onBack={() => setShowChat(false)} />
      )}
    </div>
  );
};

export default Home;
