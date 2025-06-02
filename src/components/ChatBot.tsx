import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Bot, User, Paperclip, Image, FileText, ChevronDown, Trash2, Workflow, Download } from 'lucide-react';
import ModelSelector from './ModelSelector';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  attachments?: File[];
  downloadableFile?: {
    name: string;
    content: string;
    type: string;
    size: number;
  };
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

  // تحويل الملف إلى Base64 للإرسال
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // إزالة البادئة data:application/pdf;base64, للحصول على Base64 فقط
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // تحويل الملف إلى ArrayBuffer للإرسال كـ Binary
  const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = error => reject(error);
    });
  };

  // تنزيل ملف نصي
  const downloadTextFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // تحليل الاستجابة من n8n للبحث عن ملفات
  const parseN8nResponse = (data: any) => {
    let responseContent = data.output || data.response || data.message || 'تم استلام رسالتك بنجاح من سير العمل';
    let downloadableFile = null;

    // البحث عن ملف file.text في الاستجابة
    if (data.file && data.file.name === 'file.text' && data.file.content) {
      downloadableFile = {
        name: data.file.name,
        content: data.file.content,
        type: 'text/plain',
        size: new Blob([data.file.content]).size
      };
      responseContent = 'تم إنشاء ملف نصي يحتوي على الرد الكامل. يمكنك تنزيله من الأسفل.';
    } else if (data.files && Array.isArray(data.files)) {
      // البحث في مصفوفة الملفات
      const textFile = data.files.find((file: any) => file.name === 'file.text' || file.filename === 'file.text');
      if (textFile && textFile.content) {
        downloadableFile = {
          name: textFile.name || textFile.filename || 'file.text',
          content: textFile.content,
          type: 'text/plain',
          size: new Blob([textFile.content]).size
        };
        responseContent = 'تم إنشاء ملف نصي يحتوي على الرد الكامل. يمكنك تنزيله من الأسفل.';
      }
    } else if (typeof data === 'object') {
      // البحث في جميع خصائص الكائن
      for (const key in data) {
        if (data[key] && typeof data[key] === 'object') {
          if (data[key].name === 'file.text' && data[key].content) {
            downloadableFile = {
              name: data[key].name,
              content: data[key].content,
              type: 'text/plain',
              size: new Blob([data[key].content]).size
            };
            responseContent = 'تم إنشاء ملف نصي يحتوي على الرد الكامل. يمكنك تنزيله من الأسفل.';
            break;
          }
        }
      }
    }

    return { responseContent, downloadableFile };
  };

  const sendToN8nWorkflow = async (message: string, files?: File[]) => {
    try {
      // إذا كان هناك ملفات PDF، نرسلها كـ FormData
      if (files && files.length > 0) {
        const formData = new FormData();
        
        // إضافة بيانات الرسالة
        formData.append('message', message);
        formData.append('sessionId', sessionId);
        formData.append('timestamp', new Date().toISOString());
        formData.append('user', 'chatbot-user');
        formData.append('conversationHistory', JSON.stringify(
          messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          }))
        ));

        // إضافة الملفات كـ binary
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type === 'application/pdf') {
            // إرسال PDF كـ binary
            formData.append('files', file, file.name);
            formData.append('fileTypes', file.type);
            formData.append('fileNames', file.name);
            formData.append('fileSizes', file.size.toString());
          } else {
            // للملفات الأخرى، تحويل إلى Base64
            const base64 = await fileToBase64(file);
            formData.append('fileData', base64);
            formData.append('fileName', file.name);
            formData.append('fileType', file.type);
            formData.append('fileSize', file.size.toString());
          }
        }

        const response = await fetch('https://n.mja.lat/webhook/d9a5adad-f921-42d9-adbe-79d11e58cd8a/chat', {
          method: 'POST',
          body: formData // لا نضع Content-Type header عند استخدام FormData
        });

        if (response.ok) {
          const data = await response.json();
          return parseN8nResponse(data);
        } else {
          throw new Error('فشل في الاتصال بسير العمل');
        }
      } else {
        // إرسال رسالة نصية فقط
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
          return parseN8nResponse(data);
        } else {
          throw new Error('فشل في الاتصال بسير العمل');
        }
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
        return {
          responseContent: data.choices[0].message.content,
          downloadableFile: null
        };
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
      content: inputMessage || (attachments.length > 0 ? `تم إرفاق ${attachments.length} ملف` : ''),
      sender: 'user',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage || 'ملفات مرفقة';
    const filesToSend = attachments.length > 0 ? [...attachments] : undefined;
    setInputMessage('');
    setAttachments([]);
    setIsLoading(true);

    try {
      let result: { responseContent: string; downloadableFile: any };

      if (selectedModel === 'n8n-workflow') {
        result = await sendToN8nWorkflow(messageToSend, filesToSend);
      } else {
        // OpenRouter لا يدعم الملفات حالياً
        if (filesToSend && filesToSend.length > 0) {
          result = {
            responseContent: 'عذراً، رفع الملفات متاح فقط مع سير العمل n8n. يرجى تغيير النموذج إلى "سير العمل الذكي".',
            downloadableFile: null
          };
        } else {
          result = await sendToOpenRouter(messageToSend);
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.responseContent,
        sender: 'bot',
        timestamp: new Date(),
        downloadableFile: result.downloadableFile
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
    
    // فلترة الملفات المدعومة
    const supportedFiles = files.filter(file => {
      const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain'];
      return supportedTypes.includes(file.type);
    });

    if (supportedFiles.length !== files.length) {
      alert('بعض الملفات غير مدعومة. الملفات المدعومة: PDF, صور (JPEG, PNG, GIF), ملفات نصية');
    }

    setAttachments(prev => [...prev, ...supportedFiles]);
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

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else if (fileType.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    } else {
      return <FileText className="w-4 h-4 text-gray-500" />;
    }
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
                          {getFileIcon(file.type)}
                          <span>{file.name}</span>
                          <span>({formatFileSize(file.size)})</span>
                          {file.type === 'application/pdf' && (
                            <span className="bg-red-100 text-red-600 px-1 rounded text-xs">PDF</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* عرض الملف القابل للتنزيل */}
                  {message.downloadableFile && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">{message.downloadableFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(message.downloadableFile.size)} • ملف نصي
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadTextFile(message.downloadableFile!.name, message.downloadableFile!.content)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          تنزيل
                        </button>
                      </div>
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
              {selectedModel !== 'n8n-workflow' && (
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  ⚠️ رفع الملفات متاح فقط مع سير العمل
                </span>
              )}
            </div>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.type)}
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    {file.type === 'application/pdf' && (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                        PDF Binary
                      </span>
                    )}
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
              title={selectedModel === 'n8n-workflow' ? 'رفع ملفات PDF كـ Binary' : 'رفع الملفات متاح فقط مع سير العمل'}
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={selectedModel === 'n8n-workflow' ? 'اكتب رسالتك أو ارفق ملف PDF...' : 'اكتب رسالتك هنا...'}
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
          accept=".pdf,image/*,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatBot;
