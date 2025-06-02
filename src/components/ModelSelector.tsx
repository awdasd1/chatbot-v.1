import React, { useState } from 'react';
import { ChevronDown, Brain, Workflow } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  { id: 'n8n-workflow', name: 'سير العمل n8n', description: 'سير عمل مخصص', icon: 'workflow' },
  { id: 'gpt-4', name: 'GPT-4', description: 'الأكثر ذكاءً وتطوراً', icon: 'brain' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'سريع وفعال', icon: 'brain' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'متقدم في التحليل', icon: 'brain' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'متوازن وموثوق', icon: 'brain' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'سريع ومختصر', icon: 'brain' },
  { id: 'gemini-pro', name: 'Gemini Pro', description: 'من جوجل', icon: 'brain' },
  { id: 'llama-2-70b', name: 'Llama 2 70B', description: 'مفتوح المصدر', icon: 'brain' },
  { id: 'mistral-large', name: 'Mistral Large', description: 'أوروبي متقدم', icon: 'brain' },
  { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', description: 'خليط من النماذج', icon: 'brain' },
  { id: 'palm-2', name: 'PaLM 2', description: 'من جوجل', icon: 'brain' }
];

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedModelData = models.find(model => model.id === selectedModel);

  const getIcon = (iconType: string) => {
    if (iconType === 'workflow') {
      return <Workflow className="w-4 h-4 text-green-600" />;
    }
    return <Brain className="w-4 h-4 text-purple-600" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/80 hover:bg-white/90 border border-gray-200/50 rounded-xl px-4 py-2 transition-all"
      >
        {selectedModelData && getIcon(selectedModelData.icon)}
        <span className="text-sm font-medium text-gray-700">
          {selectedModelData?.name || 'اختر النموذج'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200/50 z-20 max-h-80 overflow-y-auto">
            <div className="p-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-right p-3 rounded-lg transition-colors flex items-center gap-3 ${
                    selectedModel === model.id
                      ? model.id === 'n8n-workflow' 
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {getIcon(model.icon)}
                  <div className="flex-1 text-right">
                    <div className="font-medium text-sm">{model.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{model.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSelector;
