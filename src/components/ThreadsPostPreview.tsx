import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Repeat2, Send } from "lucide-react";
import { motion } from "framer-motion";

interface ThreadsPostPreviewProps {
    username: string;
    profilePicture?: string;
    content: string;
    images?: string[];
    timestamp?: string;
}

export function ThreadsPostPreview({
    username,
    profilePicture,
    content,
    images = [],
    timestamp = "Agora"
}: ThreadsPostPreviewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto glass-card rounded-2xl p-4 space-y-3"
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    {profilePicture ? (
                        <AvatarImage src={profilePicture} alt={username} />
                    ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                            {username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    )}
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate">
                            {username || "username"}
                        </span>
                        <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 fill-primary flex-shrink-0"
                        >
                            <path d="M12.015 2c2.55 0 4.93.917 6.773 2.594.184.17.184.456 0 .625l-1.591 1.547a.426.426 0 0 1-.585 0A7.56 7.56 0 0 0 12.015 5c-4.178 0-7.568 3.369-7.568 7.522 0 2.029.814 3.87 2.131 5.21a.426.426 0 0 1 0 .625l-1.591 1.547c-.184.17-.184.456 0 .625C6.83 22.206 9.21 23.123 11.76 23.123c4.178 0 7.567-3.369 7.567-7.522 0-2.029-.813-3.87-2.13-5.21a.426.426 0 0 1 0-.625l1.591-1.547c.184-.17.184-.456 0-.625A10.515 10.515 0 0 0 12.015 2Z" />
                        </svg>
                    </div>
                    <span className="text-xs text-muted-foreground">{timestamp}</span>
                </div>
            </div>

            {/* Content */}
            {content && (
                <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words pl-[52px]">
                    {content}
                </div>
            )}

            {/* Images */}
            {images.length > 0 && (
                <div className="pl-[52px]">
                    {images.length === 1 ? (
                        <div className="rounded-xl overflow-hidden border border-white/10">
                            <img
                                src={images[0]}
                                alt="Post"
                                className="w-full max-h-96 object-cover"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {images.slice(0, 10).map((img, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl overflow-hidden border border-white/10 aspect-square"
                                >
                                    <img
                                        src={img}
                                        alt={`Post ${i + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pl-[52px] pt-2">
                <button className="group flex items-center gap-1.5 text-muted-foreground hover:text-red-400 transition-colors">
                    <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
                <button className="group flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
                <button className="group flex items-center gap-1.5 text-muted-foreground hover:text-green-400 transition-colors">
                    <Repeat2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
                <button className="group flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Send className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* Footer Meta */}
            <div className="pl-[52px] pt-1 text-xs text-muted-foreground">
                Preview • Threads
            </div>
        </motion.div>
    );
}
