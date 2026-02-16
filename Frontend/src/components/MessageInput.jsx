import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiClick = (emojiObject) => {
    setText(text + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full bg-base-100/50 backdrop-blur-lg border-t border-base-300">
      <AnimatePresence>
        {imagePreview && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-3 flex items-center gap-2"
          >
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Preview"
                className="size-20 object-cover rounded-2xl border-2 border-primary/20 shadow-lg"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 size-6 rounded-full bg-error text-error-content
                flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            ref={emojiPickerRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-3 absolute bottom-20 left-4 z-50"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              width={300}
              height={400}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex-1 flex items-center gap-2 bg-base-200 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          
          {/* Image Picker Button */}
          <button
            type="button"
            className={`btn btn-ghost btn-circle btn-sm
                     ${imagePreview ? "text-primary" : "text-base-content/40"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Text Input */}
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base py-1 px-1 placeholder:text-base-content/30"
            placeholder="Kuch likho bhai..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Emoji Button */}
          <button 
            type="button" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="hidden sm:flex btn btn-ghost btn-circle btn-sm text-base-content/40 hover:text-primary transition-colors"
          >
            <Smile size={20} />
          </button>
        </div>

        {/* Send Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="submit"
          className={`btn btn-circle shadow-lg transition-all
            ${(text.trim() || imagePreview) 
              ? "btn-primary shadow-primary/20" 
              : "btn-ghost bg-base-200 text-base-content/20 cursor-not-allowed"}`}
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} className={text.trim() || imagePreview ? "translate-x-0.5" : ""} />
        </motion.button>
      </form>
    </div>
  );
};

export default MessageInput;