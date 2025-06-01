import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Bot, User, Paperclip, Image, FileText, ChevronDown, Trash2 } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setInputMessage('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Simulate API call to OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'user', content: inputMessage }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.choices[0].message.content,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('فشل في الاتصال بالخدمة');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
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
            <div className="w-10 h-10 chat-gradient rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">تشات بوت ذكي</h1>
              <p className="text-sm text-gray-500">متصل الآن</p>
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
                <div className="w-8 h-8 chat-gradient rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
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
              <div className="w-8 h-8 chat-gradient rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
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
                placeholder="اكتب رسالتك هنا..."
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
              className="flex-shrink-0 w-10 h-10 chat-gradient rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
