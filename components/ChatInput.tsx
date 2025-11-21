
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, CloseIcon, StopIcon, PlusIcon, CameraIcon, GalleryIcon, FileIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (prompt: string, file: File | null) => void;
  isLoading: boolean;
  onStopGenerating: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, onStopGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
            setAttachmentMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview('file');
      }
      setAttachmentMenuOpen(false); // Close menu after selection
    }
    // Reset input value to allow selecting the same file again.
    if (e.target) {
        e.target.value = '';
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    setFilePreview(null);
  };
  
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 224; // Corresponds to max-h-56
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    adjustTextareaHeight();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((prompt.trim() || attachedFile) && !isLoading) {
      onSendMessage(prompt, attachedFile);
      setPrompt('');
      handleRemoveFile();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };
  
  return (
    <>
      {/* Use className="hidden" for tailwind and add IDs for labels */}
      <input
        type="file"
        id="camera-input"
        onChange={handleFileSelect}
        className="hidden"
        capture="environment"
        accept="image/*"
      />
      <input
        type="file"
        id="gallery-input"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*"
      />
      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {attachedFile && (
              <div className="py-2 relative w-fit">
                  {filePreview && filePreview !== 'file' && attachedFile.type.startsWith('image/') ? (
                      <img src={filePreview} alt="Selected preview" className="h-20 w-auto max-w-xs object-cover rounded-lg border border-slate-300 dark:border-slate-600"/>
                  ) : (
                      <div className="h-20 max-w-xs p-2 flex items-center gap-2 bg-slate-200 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                          <FileIcon className="w-8 h-8 text-slate-500 flex-shrink-0" />
                          <div className="text-sm text-slate-700 dark:text-slate-200 overflow-hidden">
                              <p className="font-medium truncate">{attachedFile.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{Math.round(attachedFile.size / 1024)} KB</p>
                          </div>
                      </div>
                  )}
                  <button
                      onClick={handleRemoveFile}
                      className="absolute -top-0 -right-2 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
                      aria-label="Remove file"
                  >
                      <CloseIcon className="w-4 h-4" />
                  </button>
              </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-end gap-3 py-3">
            <div className="relative" ref={attachmentMenuRef}>
              {attachmentMenuOpen && (
                   <div className="absolute bottom-full mb-2 w-48 origin-bottom-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-20">
                      <label htmlFor="camera-input" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer">
                          <CameraIcon/> Camera
                      </label>
                      <label htmlFor="gallery-input" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer">
                          <GalleryIcon/> Gallery
                      </label>
                  </div>
              )}
              <button
                  type="button"
                  onClick={() => setAttachmentMenuOpen(prev => !prev)}
                  disabled={isLoading}
                  className="flex-shrink-0 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white disabled:opacity-50 p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                  aria-label="Attach file"
              >
                  <PlusIcon />
              </button>
            </div>
            
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Nik anything..."
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-2xl py-3 px-5 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none disabled:opacity-50 transition-all max-h-56"
            />
            <button
              type={isLoading ? "button" : "submit"}
              onClick={isLoading ? onStopGenerating : undefined}
              disabled={!isLoading && (!prompt.trim() && !attachedFile)}
              className={`flex-shrink-0 text-white rounded-full p-3 transition-all focus:ring-2 focus:outline-none self-end ${
                  isLoading 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500 disabled:from-slate-400 disabled:to-slate-500 dark:disabled:from-slate-600 dark:disabled:to-slate-700 disabled:cursor-not-allowed'
              }`}
              aria-label={isLoading ? "Stop generating" : "Send message"}
            >
              {isLoading ? <StopIcon className="w-6 h-6"/> : <SendIcon className="w-6 h-6"/>}
            </button>
          </form>
        </div>
      </footer>
    </>
  );
};

export default React.memo(ChatInput);