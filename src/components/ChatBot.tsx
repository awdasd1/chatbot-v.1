import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Bot, User, Paperclip, Image, FileText, ChevronDown, Trash2, Workflow } from 'lucide-react';
import ModelSelector from './ModelSelector';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  attachments?: File[];
}

interface ChatBotProps {
  onBack: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sessionId] = useState(() => {
    // إنشاء sessionId فريد لكل جلسة محادثة
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendToN8nWorkflow = async (message: string) => {
    try {
      const response = await fetch('https://n.mja.lat/webhook/d9a5adad-f921-42d9-adbe-79d11e58cd8a/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: sessionId,
          timestamp: new Date().toISOString(),
          user: 'chatbot-user',
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        // استخراج الرد من حقل output
        return data.output || data.response || data.message || 'تم استلام رسالتك بنجاح من سير العمل';
      } else {
        throw new Error('فشل في الاتصال بسير العمل');
      }
    } catch (error) {
      throw new Error('عذراً، حدث خطأ في الاتصال بسير العمل');
    }
  };

  const sendToOpenRouter = async (message: string) => {
    try {
      // إنشاء تاريخ المحادثة للسياق
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // إضافة الرسالة الحالية
      conversationHistory.push({ role: 'user', content: message });

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: conversationHistory,
          metadata: {
            sessionId: sessionId,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      } else {
        throw new Error('فشل في الاتصال بالخدمة');
      }
    } catch (error) {
      throw new Error('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setAttachments([]);
    setIsLoading(true);

    try {
      let responseContent: string;

      if (selectedModel === 'n8n-workflow') {
        responseContent = await sendToN8nWorkflow(messageToSend);
      } else {
        responseContent = await sendToOpenRouter(messageToSend);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBotIcon = () => {
    if (selectedModel === 'n8n-workflow') {
      return <Workflow className="w-6 h-6 text-white" />;
    }
    return <Bot className="w-6 h-6 text-white" />;
  };

  const getBotIconSmall = () => {
    if (selectedModel === 'n8n-workflow') {
      return <Workflow className="w-4 h-4 text-white" />;
    }
    return <Bot className="w-4 h-4 text-white" />;
  };

  const getChatGradient = () => {
    if (selectedModel === 'n8n-workflow') {
      return 'bg-gradient-to-r from-green-500 to-emerald-600';
    }
    return 'chat-gradient';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${getChatGradient()} rounded-full flex items-center justify-center`}>
              {getBotIcon()}
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">
                {selectedModel === 'n8n-workflow' ? 'سير العمل الذكي' : 'تشات بوت ذكي'}
              </h1>
              <p className="text-sm text-gray-500">متصل الآن</p>
              <p className="text-xs text-gray-400">الجلسة: {sessionId.split('_')[1]}</p>
            </div>
          </div>

          <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6 mb-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className={`w-8 h-8 ${getChatGradient()} rounded-full flex items-center justify-center flex-shrink-0`}>
                  {getBotIconSmall()}
                </div>
              )}
              
              <div className={`max-w-xs md:max-w-md lg:max-w-lg ${message.sender === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'message-user text-white'
                      : 'bg-white shadow-sm border border-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs opacity-80">
                          {file.type.startsWith('image/') ? (
                            <Image className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                          <span>{file.name}</span>
                          <span>({formatFileSize(file.size)})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString('ar-SA', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 message-user rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className={`w-8 h-8 ${getChatGradient()} rounded-full flex items-center justify-center`}>
                {getBotIconSmall()}
              </div>
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">الملفات المرفقة:</span>
            </div>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    {file.type.startsWith('image/') ? (
                      <Image className="w-4 h-4 text-blue-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                  </div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4">
          <div className="flex gap-3 items-end">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={selectedModel === 'n8n-workflow' ? 'اكتب رسالتك لسير العمل...' : 'اكتب رسالتك هنا...'}
                className="w-full resize-none border-0 focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-500"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={isLoading || (!inputMessage.trim() && attachments.length === 0)}
              className={`flex-shrink-0 w-10 h-10 ${getChatGradient()} rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatBot;
